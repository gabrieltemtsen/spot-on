"use client";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/menu";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, total } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0d1f17] border-l border-white/10 z-50 flex flex-col slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            Your Cart
            {items.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <span className="text-6xl">🛒</span>
              <p className="text-gray-400">Your cart is empty</p>
              <button onClick={closeCart} className="px-6 py-2 rounded-full bg-green-700 text-white text-sm font-semibold hover:bg-green-600 transition-colors">
                Browse Menu
              </button>
            </div>
          ) : (
            items.map(({ item, quantity }) => (
              <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl`}>
                      {item.emoji}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-green-400 text-sm font-bold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateQty(item.id, quantity - 1)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                  <span className="text-white font-bold w-4 text-center">{quantity}</span>
                  <button onClick={() => updateQty(item.id, quantity + 1)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full bg-red-900/40 flex items-center justify-center hover:bg-red-800/60 transition-colors ml-1">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 space-y-3">
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Subtotal</span>
              <span className="text-green-400">{formatPrice(total())}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full py-4 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-center transition-colors"
            >
              Proceed to Checkout →
            </Link>
            <p className="text-gray-500 text-xs text-center">Delivery fees (if any) added at checkout</p>
          </div>
        )}
      </div>
    </>
  );
}
