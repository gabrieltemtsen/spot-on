"use client";
import Link from "next/link";
import { ShoppingCart, Leaf } from "lucide-react";
import { useCart } from "@/store/cart";

export default function Navbar() {
  const { count, openCart } = useCart();
  const c = count();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/60 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </span>
          <span className="text-white">Spot<span className="text-orange-400">-On</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/menu" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors">
            Order Now
          </Link>
          <button
            onClick={openCart}
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {c > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                {c}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
