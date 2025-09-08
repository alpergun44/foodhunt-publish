
import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Datastore from "nedb-promises";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import { parse } from "csv-parse";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const PORT = process.env.PORT || 5050;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "changeme";
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// DB (file-based, no native build pain)
const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const itemsDB = Datastore.create({ filename: path.join(dbDir, "items.db"), autoload: true });
const eventsDB = Datastore.create({ filename: path.join(dbDir, "events.db"), autoload: true });

// App
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(UPLOAD_DIR));

// Helpers
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ ok:false, error:"unauthorized" });
  }
  next();
}

// Health
app.get("/api/health", (req, res) => {
  res.json({ ok:true, uptime: process.uptime(), version: "1.0.0" });
});

// Catalog (public)
app.get("/api/catalog", async (req, res) => {
  const { city, area } = req.query;
  const limit = Math.min(parseInt(req.query.limit || "16", 10), 48);

  const query = {};
  if (city) query.city = new RegExp(`^${String(city)}$`, "i");
  if (area) query.area = new RegExp(`^${String(area)}$`, "i");

  let items = await itemsDB.find(query).sort({ updatedAt: -1 }).limit(limit);
  if (items.length < Math.min(12, limit)) {
    // top-up with any
    const extra = await itemsDB.find({}).limit(Math.min(12, limit) - items.length);
    // dedupe by id
    const seen = new Set(items.map(x => x.id));
    for (const x of extra) if (!seen.has(x.id)) items.push(x);
  }
  res.json({ area: area||null, city: city||null, version: new Date().toISOString(), items });
});

// Events (public)
app.post("/api/events", async (req, res) => {
  const { event_type, session_id, payload } = req.body || {};
  if (!event_type) return res.status(400).json({ ok:false, error:"event_type required" });
  const ev = { id: nanoid(), ts: new Date().toISOString(), event_type, session_id: session_id||null, payload: payload||{} };
  await eventsDB.insert(ev);
  res.json({ ok:true, id: ev.id });
});

// Admin: items CRUD
app.get("/api/admin/items", requireAdmin, async (req, res) => {
  const { city, area, q } = req.query;
  const query = {};
  if (city) query.city = new RegExp(String(city), "i");
  if (area) query.area = new RegExp(String(area), "i");
  if (q) query.name = new RegExp(String(q), "i");
  const items = await itemsDB.find(query).sort({ updatedAt: -1 });
  res.json({ ok:true, items });
});

app.post("/api/admin/items", requireAdmin, async (req, res) => {
  const x = req.body || {};
  const id = x.id || nanoid();
  const now = new Date().toISOString();
  const item = {
    id,
    name: String(x.name||"").trim(),
    archetype: String(x.archetype||"").trim(),
    cuisine: String(x.cuisine||"").trim(),
    price_band: Number(x.price_band||1),
    satiety: Number(x.satiety||3),
    spicy: Number(x.spicy||0),
    diet_tags: Array.isArray(x.diet_tags) ? x.diet_tags : String(x.diet_tags||"").split(",").map(s=>s.trim()).filter(Boolean),
    temp: String(x.temp||"hot").trim(),
    kcal_range: String(x.kcal_range||"").trim(),
    macros_hint: String(x.macros_hint||"").trim(),
    image_url: String(x.image_url||"").trim(),
    city: String(x.city||"").trim(),
    area: String(x.area||"").trim(),
    createdAt: now,
    updatedAt: now
  };
  if (!item.name || !item.city || !item.area) return res.status(400).json({ ok:false, error:"name, city, area required" });
  await itemsDB.insert(item);
  res.json({ ok:true, item });
});

app.put("/api/admin/items/:id", requireAdmin, async (req, res) => {
  const id = req.params.id;
  const patch = req.body || {};
  patch.updatedAt = new Date().toISOString();
  await itemsDB.update({ id }, { $set: patch }, { returnUpdatedDocs: true, multi: false });
  const doc = await itemsDB.findOne({ id });
  res.json({ ok:true, item: doc });
});

app.delete("/api/admin/items/:id", requireAdmin, async (req, res) => {
  const id = req.params.id;
  await itemsDB.remove({ id }, { multi: false });
  res.json({ ok:true });
});

// Admin: upload (disk storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const name = nanoid() + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

app.post("/api/admin/upload", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ ok:false, error:"file required" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ ok:true, url });
});

// Admin: CSV import (header must match basic fields)
app.post("/api/admin/import-csv", requireAdmin, express.urlencoded({ extended:true }), async (req, res) => {
  const csvText = req.body.csv;
  if (!csvText) return res.status(400).json({ ok:false, error:"csv field required (raw text)" });
  parse(csvText, { columns:true, trim:true }, async (err, records) => {
    if (err) return res.status(400).json({ ok:false, error:String(err) });
    let added = 0;
    for (const r of records) {
      const now = new Date().toISOString();
      const item = {
        id: r.id || nanoid(),
        name: r.name,
        archetype: r.archetype || "",
        cuisine: r.cuisine || "",
        price_band: Number(r.price_band || 1),
        satiety: Number(r.satiety || 3),
        spicy: Number(r.spicy || 0),
        diet_tags: (r.diet_tags||"").split(",").map(s=>s.trim()).filter(Boolean),
        temp: r.temp || "hot",
        kcal_range: r.kcal_range || "",
        macros_hint: r.macros_hint || "",
        image_url: r.image_url || "",
        city: r.city || "",
        area: r.area || "",
        createdAt: now,
        updatedAt: now
      };
      if (item.name && item.city && item.area) {
        await itemsDB.insert(item);
        added++;
      }
    }
    res.json({ ok:true, added });
  });
});

app.listen(PORT, () => {
  console.log(`FoodHunt backend ready on http://localhost:${PORT}`);
  console.log(`Admin token: ${ADMIN_TOKEN === "changeme" ? "changeme (set ADMIN_TOKEN in .env!)" : "********"}`);
});
