
import { FC } from "react";

type Item = {
  id: string;
  name: string;
  cuisine: string;
  price_band: number;
  kcal_range: string;
  spicy: number;
  image_url: string;
};

const Tile: FC<{ item: Item; onPick: (id: string) => void }> = ({ item, onPick }) => {
  return (
    <button className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-brand transition text-left" onClick={() => onPick(item.id)}>
      <img src={item.image_url || `https://placehold.co/800x600?text=${encodeURIComponent(item.name)}`} className="w-full h-56 object-cover" alt={item.name} />
      <div className="p-3 flex items-center justify-between">
        <div>
          <div className="font-bold">{item.name}</div>
          <div className="text-xs text-slate-400">{item.cuisine} • {"₺".repeat(item.price_band)} • {item.kcal_range}</div>
        </div>
        <div className="pill">{item.spicy > 0 ? "🌶".repeat(item.spicy) : "🙂"}</div>
      </div>
    </button>
  );
}

export default Tile;
