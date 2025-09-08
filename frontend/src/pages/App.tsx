
import { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { fetchCatalog, track } from "../api";
import Tile from "../components/Tile";

type Item = {
  id: string;
  name: string;
  archetype: string;
  cuisine: string;
  price_band: number;
  satiety: number;
  spicy: number;
  diet_tags: string[];
  temp: string;
  kcal_range: string;
  macros_hint: string;
  image_url: string;
  city: string;
  area: string;
};

const nano = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

export default function App() {
  const [sessionId] = useState(() => `s_${nano()}`);
  const [city, setCity] = useState("Istanbul");
  const [area, setArea] = useState("Kadikoy");
  const [budget, setBudget] = useState(2);
  const [mode, setMode] = useState("cheat");

  const [round, setRound] = useState(1);
  const [pairs, setPairs] = useState<[Item, Item][]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [winners, setWinners] = useState<Item[]>([]);
  const [winner, setWinner] = useState<Item | null>(null);
  const [finalists, setFinalists] = useState<Item[] | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => { track("APP_MOUNT", {}, sessionId); }, [sessionId]);

  function shuffle<T>(arr: T[]): T[] {
    return arr.map(v => [Math.random(), v] as const).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  }
  function makePairs<T>(list: T[]): [T,T][] {
    const pairs: [T,T][] = [];
    for (let i = 0; i < list.length; i += 2) pairs.push([list[i], list[i+1]]);
    return pairs;
  }

  async function startFlow() {
    setStartedAt(Date.now());
    setRound(1); setPairIndex(0); setWinners([]); setWinner(null); setFinalists(null);
    track("GAME_START", { city, area, budget, mode }, sessionId);
    const data = await fetchCatalog(city, area, 24);
    const items: Item[] = data.items;
    const filtered = items.filter(x => x.price_band <= budget + 1);
    let pool = shuffle(filtered).slice(0, 12);
    if (pool.length % 2 === 1) pool = pool.slice(0, pool.length - 1);
    setPairs(makePairs(pool));
    setPairIndex(0);
  }

  function pick(chosenId: string) {
    const [left, right] = pairs[pairIndex];
    const chosen = left.id === chosenId ? left : right;
    const loser = left.id === chosenId ? right : left;
    track("CHOOSE", { round, winner_id: chosen.id, loser_id: loser.id }, sessionId);

    setWinners(prev => [...prev, chosen]);

    if (pairIndex + 1 < pairs.length) {
      setPairIndex(i => i + 1);
      return;
    }

    setTimeout(() => {
      const roundWinners = [...winners, chosen];
      if (roundWinners.length === 1) {
        const champ = roundWinners[0];
        const others: Item[] = pairs.flat().filter(x => x.id !== champ.id);
        const top3 = [champ, ...shuffle(others).slice(0, 2)];
        setWinner(champ);
        setFinalists(top3);
        const ttc_ms = startedAt ? Date.now() - startedAt : null;
        track("GAME_COMPLETE", { ttc_ms, winner_id: champ.id, finalists: top3.map(x => x.id) }, sessionId);
      } else {
        const nextPool = shuffle(roundWinners);
        const evenPool = nextPool.length % 2 === 0 ? nextPool : nextPool.slice(0, nextPool.length - 1);
        setPairs(makePairs(evenPool));
        setPairIndex(0);
        setWinners([]);
        setRound(r => r + 1);
      }
    }, 50);
  }

  return (
    <div className="container py-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">FoodHunt</h1>
        <a className="btn" href="/admin">Admin</a>
      </header>

      <div className="card p-4 mb-6">
        <div className="grid-2">
          <div>
            <div className="label">Şehir</div>
            <input className="input" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <div className="label">Semt</div>
            <input className="input" value={area} onChange={e => setArea(e.target.value)} />
          </div>
          <div>
            <div className="label">Bütçe (₺ bandı)</div>
            <input type="range" min={1} max={5} value={budget} onChange={e => setBudget(parseInt(e.target.value))} />
            <div className="text-xs text-slate-400 mt-1">Seviye: {budget}</div>
          </div>
          <div>
            <div className="label">Mod</div>
            <select className="input" value={mode} onChange={e => setMode(e.target.value)}>
              <option value="light">hafif</option>
              <option value="spicy">acı</option>
              <option value="healthy">sağlıklı</option>
              <option value="cheat">cheat</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button className="btn btn-primary" onClick={startFlow}>Başlat</button>
        </div>
      </div>

      {winner && finalists ? (
        <div className="card p-4">
          <h2 className="text-xl font-bold mb-2">Sonuç</h2>
          <p className="text-slate-400 mb-4">Top-3 önerin burada.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {finalists.map(x => (
              <div key={x.id} className="rounded-2xl overflow-hidden border border-slate-800">
                <img src={x.image_url || `https://placehold.co/800x600?text=${encodeURIComponent(x.name)}`} className="w-full h-48 object-cover" />
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold">{x.name}</div>
                    <div className="text-xs text-slate-400">{x.cuisine} • {"₺".repeat(x.price_band)} • {x.kcal_range}</div>
                  </div>
                  <a className="btn" href={`https://www.google.com/search?q=${encodeURIComponent(x.name + " " + (x.area||""))}`} target="_blank">Dışarıda ara</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : pairs.length > 0 ? (
        <div className="card p-4">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
            <div>{area}</div>
            <div>Tur {round} • Kalan çift: {pairs.length - pairIndex}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Tile item={pairs[pairIndex][0]} onPick={pick} />
            <Tile item={pairs[pairIndex][1]} onPick={pick} />
          </div>
        </div>
      ) : (
        <div className="text-slate-400">Başlamak için ayarları yap ve "Başlat" butonuna bas.</div>
      )}
    </div>
  );
}
