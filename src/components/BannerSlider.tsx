import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, Gift, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  bgGradient: string;
  promoCode: string;
}

const BANNERS: Banner[] = [
  {
    id: 1,
    title: "FREE FIRE SUPER CHARGE",
    subtitle: "Get instantly 10% bonus Diamonds on all packages. Live validation matching bKash automated API.",
    badge: "10% Extra",
    icon: Sparkles,
    bgGradient: "from-blue-900 via-slate-900 to-indigo-900 border border-indigo-500/20",
    promoCode: "FFDIAMOND"
  },
  {
    id: 2,
    title: "LINZO LOYALTY CLUB LAUNCH",
    subtitle: "Convert active gaming points directly to top-up discount coupons. Claim free $1.50 coupon code.",
    badge: "VIP Benefit",
    icon: Gift,
    bgGradient: "from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20",
    promoCode: "BOOM777"
  },
  {
    id: 3,
    title: "PUBG MOBILE FLASH RECHARGE",
    subtitle: "Save up to 15% on UC bulk packages. Fastest delivery in 60 seconds with order status tracking alerts.",
    badge: "Flash Sale Live",
    icon: Zap,
    bgGradient: "from-[#101b35] via-slate-900 to-indigo-950 border border-indigo-500/20",
    promoCode: "LINZOMOBILE"
  }
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % BANNERS.length);
  const prev = () => setCurrent((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  const BannerIcon = BANNERS[current].icon;

  return (
    <div className="relative overflow-hidden rounded-2xl glow-card mb-8">
      <div className={`relative h-[160px] sm:h-[180px] md:h-[220px] bg-gradient-to-r ${BANNERS[current].bgGradient} p-6 sm:p-8 flex flex-col justify-between transition-all duration-700`}>
        {/* Absolute design assets */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent)] pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

        {/* Banner Content */}
        <div className="z-10 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                {BANNERS[current].badge}
              </span>
              <div className="flex items-center gap-1 text-white/80 font-mono text-[10px] sm:text-xs">
                <BannerIcon size={12} />
                <span>Instantly Active</span>
              </div>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-tight uppercase max-w-xl truncate">
              {BANNERS[current].title}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm max-w-lg mt-1 line-clamp-2 md:line-clamp-none font-medium">
              {BANNERS[current].subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">Use Coupon:</span>
            <div className="bg-black/25 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15">
              <span className="font-mono text-xs font-black text-yellow-300 tracking-wider">
                {BANNERS[current].promoCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(BANNERS[current].promoCode);
                  alert(`Copied code: ${BANNERS[current].promoCode}! Paste in payment screen for discount.`);
                }}
                className="text-white/60 hover:text-white transition-all text-[10px] font-bold border-l border-white/10 pl-2.5 ml-1 select-none"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Controls - Chevron buttons */}
        <div className="absolute right-4 bottom-4 flex gap-1.5 z-10">
          <button
            onClick={prev}
            className="p-1.5 text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg transition-all border border-white/5 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="p-1.5 text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg transition-all border border-white/5 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
