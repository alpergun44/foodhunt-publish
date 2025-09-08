
import { useEffect, useMemo, useState } from "react";
import { adminCreate, adminDelete, adminImportCSV, adminList, adminUpdate, adminUpload } from "../api";

type Item = {
  id?: string;
  name: string;
  archetype?: string;
  cuisine?: string;
  price_band?: number;
  satiety?: number;
  spicy?: number;
  diet_tags?: string[] | string;
  temp?: string;
  kcal_range?: string;
  macros_hint?: string;
  image_url?: string;
  city: string;
  area: string;
};

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("fh_admin_token") || "");
  const [city, setCity] = useState("Istanbul");
  const [area, setArea] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Item>({ name:"", city:"Istanbul", area:"Kadikoy" });
  const authed = !!token;

  useEffect(() => {
    if (authed) refresh();
  }, [token, city, area, q]);

  function saveToken() {
    localStorage.setItem("fh_admin_token", token);
    refresh();
  }

  async function refresh() {
    try {
      const res = await adminList({ city, area, q });
      setItems(res.items || []);
    } catch (e) {
      console.error(e);
      alert("Yetki hatası veya sunucu kapalı.");
    }
  }

  async function onCreate() {
    try {
      const res = await adminCreate(draft);
      setDraft({ name:"", city, area });
      refresh();
    } catch (e) { alert("Kaydetme hatası"); }
  }

  async function onUpdate(it: Item, patch: Partial<Item>) {
    try {
      await adminUpdate(it.id!, patch);
      refresh();
    } catch (e) { alert("Güncelleme hatası"); }
  }

  async function onDelete(it: Item) {
    if (!confirm(`Silinsin mi: ${it.name}?`)) return;
    try { await adminDelete(it.id!); refresh(); } catch (e) { alert("Silme hatası"); }
  }

  async function onUpload(file: File) {
    const res = await adminUpload(file);
    setDraft(d => ({ ...d, image_url: res.url }));
  }

  async function onImport(csvText: string) {
    try {
      const res = await adminImportCSV(csvText);
      alert(`${res.added} kayıt eklendi`);
      refresh();
    } catch (e) { alert("Import hatası"); }
  }

  if (!authed) {
    return (
      <div className="container py-12">
        <div className="card p-6 max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-4">Admin Girişi</h1>
          <div className="label">Admin Token</div>
          <input className="input mb-4" value={token} onChange={e=>setToken(e.target.value)} placeholder="ENV: ADMIN_TOKEN" />
          <button className="btn btn-primary w-full" onClick={saveToken}>Giriş yap</button>
          <p className="text-xs text-slate-400 mt-3">Token'ı .env'deki ADMIN_TOKEN ile aynı gir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Admin</h1>
        <button className="btn" onClick={() => { localStorage.removeItem("fh_admin_token"); location.reload(); }}>Çıkış</button>
      </div>

      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <div className="label">Şehir</div>
            <input className="input" value={city} onChange={e=>setCity(e.target.value)} />
          </div>
          <div>
            <div className="label">Semt</div>
            <input className="input" value={area} onChange={e=>setArea(e.target.value)} placeholder="(opsiyonel)" />
          </div>
          <div>
            <div className="label">Ara</div>
            <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="isim" />
          </div>
          <div className="flex items-end">
            <button className="btn w-full" onClick={refresh}>Listele</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create */}
        <div className="card p-4">
          <h2 className="font-bold mb-2">Yeni Ürün</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><div className="label">İsim*</div><input className="input" value={draft.name} onChange={e=>setDraft({...draft, name:e.target.value})}/></div>
            <div><div className="label">Arketip</div><input className="input" value={draft.archetype||""} onChange={e=>setDraft({...draft, archetype:e.target.value})}/></div>
            <div><div className="label">Mutfak</div><input className="input" value={draft.cuisine||""} onChange={e=>setDraft({...draft, cuisine:e.target.value})}/></div>
            <div><div className="label">Şehir*</div><input className="input" value={draft.city} onChange={e=>setDraft({...draft, city:e.target.value})}/></div>
            <div><div className="label">Semt*</div><input className="input" value={draft.area} onChange={e=>setDraft({...draft, area:e.target.value})}/></div>
            <div><div className="label">Fiyat bandı</div><input className="input" type="number" min={1} max={5} value={draft.price_band||1} onChange={e=>setDraft({...draft, price_band: Number(e.target.value)})}/></div>
            <div><div className="label">Doyuruculuk</div><input className="input" type="number" min={1} max={5} value={draft.satiety||3} onChange={e=>setDraft({...draft, satiety: Number(e.target.value)})}/></div>
            <div><div className="label">Acılık</div><input className="input" type="number" min={0} max={3} value={draft.spicy||0} onChange={e=>setDraft({...draft, spicy: Number(e.target.value)})}/></div>
            <div><div className="label">Diyet etiketleri</div><input className="input" placeholder="vegan, halal" value={Array.isArray(draft.diet_tags)?draft.diet_tags.join(","):(draft.diet_tags||"")} onChange={e=>setDraft({...draft, diet_tags:e.target.value})}/></div>
            <div><div className="label">Sıcak/Soğuk</div><input className="input" value={draft.temp||"hot"} onChange={e=>setDraft({...draft, temp:e.target.value})}/></div>
            <div><div className="label">Kalori aralığı</div><input className="input" value={draft.kcal_range||""} onChange={e=>setDraft({...draft, kcal_range:e.target.value})}/></div>
            <div><div className="label">Makro ipucu</div><input className="input" value={draft.macros_hint||""} onChange={e=>setDraft({...draft, macros_hint:e.target.value})}/></div>
            <div className="md:col-span-2">
              <div className="label">Görsel URL</div>
              <input className="input" value={draft.image_url||""} onChange={e=>setDraft({...draft, image_url:e.target.value})}/>
              <div className="text-xs text-slate-400 mt-1">Veya aşağıdan yükle</div>
              <input type="file" accept="image/*" onChange={async e=>{ const f=e.target.files?.[0]; if(f){ await onUpload(f); }}} className="mt-1" />
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={onCreate}>Kaydet</button>
          </div>
        </div>

        {/* List */}
        <div className="card p-4">
          <h2 className="font-bold mb-2">Kayıtlar</h2>
          <div className="max-h-[480px] overflow-auto space-y-2">
            {items.map(it => (
              <div key={it.id} className="border border-slate-800 rounded-xl p-3">
                <div className="flex gap-3">
                  <img src={it.image_url || `https://placehold.co/120x80?text=${encodeURIComponent(it.name)}`} className="w-24 h-16 object-cover rounded-lg border border-slate-700" />
                  <div className="flex-1">
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-xs text-slate-400">{it.city} / {it.area} • {"₺".repeat(it.price_band || 1)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn" onClick={()=>onUpdate(it,{ image_url: prompt("Yeni görsel URL", it.image_url || "") || it.image_url })}>Görsel</button>
                    <button className="btn" onClick={()=>onUpdate(it,{ name: prompt("Yeni isim", it.name) || it.name })}>Düzenle</button>
                    <button className="btn" onClick={()=>onDelete(it)}>Sil</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <details>
              <summary className="cursor-pointer">CSV içe aktar</summary>
              <textarea className="input h-40 mt-2" placeholder="CSV ham metni buraya yapıştırın (başlık satırı gerekli)"></textarea>
              <button className="btn mt-2" onClick={(e)=>{
                const ta = (e.currentTarget.previousElementSibling as HTMLTextAreaElement);
                onImport(ta.value);
              }}>İçe aktar</button>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
