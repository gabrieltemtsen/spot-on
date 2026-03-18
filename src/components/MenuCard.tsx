"use client";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/menu";
import { useCart } from "@/store/cart";

interface CardItem {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: string[];
  price: number;
  emoji: string;
  gradient: string;
  badge?: string;
  imageUrl?: string | null; // from Convex storage
}

export default function MenuCard({ item }: { item: CardItem }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ ...item, id: item.id } as Parameters<typeof addItem>[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">
      {/* Product thumbnail — real image if available, emoji+gradient fallback */}
      <div className="relative h-36 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
            <span className="text-6xl drop-shadow-lg select-none">{item.emoji}</span>
          </div>
        )}
        {item.badge && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
            {item.badge}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-white text-base leading-tight">{item.name}</h3>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {item.ingredients.slice(0, 4).map((ing) => (
            <span key={ing} className="px-2 py-0.5 bg-white/10 rounded-full text-gray-300 text-xs">{ing}</span>
          ))}
          {item.ingredients.length > 4 && (
            <span className="px-2 py-0.5 bg-white/10 rounded-full text-gray-400 text-xs">+{item.ingredients.length - 4} more</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-green-400 font-bold text-lg">{formatPrice(item.price)}</span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              added ? "bg-green-600 text-white" : "bg-orange-500 hover:bg-orange-400 text-white active:scale-95"
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {added ? "Added!" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
