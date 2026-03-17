import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CartDrawer from "@/components/CartDrawer";
import Link from "next/link";
import { ArrowRight, Zap, Leaf, Clock } from "lucide-react";

export default function Home() {
  return (
    <main className="bg-[#081C15] min-h-screen">
      <Navbar />
      <CartDrawer />
      <Hero />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Three simple steps to fresh goodness</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Leaf className="w-8 h-8 text-green-400" />, step: "01", title: "Pick Your Items", desc: "Browse our full menu of cold-pressed juices, smoothies, and fresh salads." },
            { icon: <Zap className="w-8 h-8 text-orange-400" />, step: "02", title: "Place Your Order", desc: "Add to cart, fill in your details, choose pickup or delivery." },
            { icon: <Clock className="w-8 h-8 text-yellow-400" />, step: "03", title: "Get It Fresh", desc: "We prepare it fresh to order. Track your order status in real time." },
          ].map((s) => (
            <div key={s.step} className="relative p-8 rounded-2xl bg-white/5 border border-white/10 text-center hover:border-green-600/40 transition-all group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-green-900 border border-green-600/40 flex items-center justify-center text-green-400 text-xs font-bold">
                {s.step}
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-5 mt-2 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
              <p className="text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-green-900 via-green-800 to-orange-900 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #F4822A 0%, transparent 50%), radial-gradient(circle at 70% 50%, #52B788 0%, transparent 50%)" }} />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Ready to feel good?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">Fresh ingredients. Zero compromise. Made for you, right now.</p>
            <Link href="/menu" className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg transition-all hover:scale-105">
              See Full Menu <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 text-center text-gray-500 text-sm">
        <p className="text-white font-bold text-lg mb-2">🍊 Spot-On</p>
        <p>Fresh Juices · Smoothies · Salads · Made Daily</p>
        <p className="mt-4 text-xs">© {new Date().getFullYear()} Spot-On. All rights reserved.</p>
      </footer>
    </main>
  );
}
