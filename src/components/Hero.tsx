"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const floaters = ["🍊", "🍍", "🥗", "🍉", "🥒", "🌿", "🍋", "🥤", "🫐", "🥕"];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#081C15]">
      {/* Glow blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating emojis */}
      {floaters.map((emoji, i) => (
        <span
          key={i}
          className={`absolute text-2xl sm:text-3xl select-none pointer-events-none opacity-30 ${
            i % 3 === 0 ? "animate-float" : i % 3 === 1 ? "animate-float-delay" : "animate-float-slow"
          }`}
          style={{
            top: `${10 + (i * 8) % 80}%`,
            left: `${5 + (i * 9) % 90}%`,
          }}
        >
          {emoji}
        </span>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/60 border border-green-600/40 text-green-400 text-sm font-medium mb-8 fade-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Now taking orders · Fresh made daily
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-6 leading-none fade-up">
          <span className="text-white">Fresh. Pure.</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
            Spot-On.
          </span>
        </h1>

        <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 fade-up">
          Cold-pressed juices, power smoothies & fresh salads —
          made to order, delivered to you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 fade-up">
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(244,130,42,0.7)]"
          >
            Order Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all"
          >
            <Sparkles className="w-5 h-5 text-green-400" /> View Menu
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-center fade-up">
          {[
            { num: "11", label: "Juices" },
            { num: "5", label: "Smoothies" },
            { num: "2", label: "Salads" },
            { num: "100%", label: "Fresh Daily" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-white">{s.num}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-500 text-xs animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-gray-500" />
        scroll
      </div>
    </section>
  );
}
