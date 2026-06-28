import React from "react";
import { Game } from "../types";
import { Gamepad2, Gift, Play, Flame, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

interface GameCardProps {
  key?: string | number;
  game: Game;
  onSelect: (game: any) => void;
}

export default function GameCard({ game, onSelect }: GameCardProps) {
  const { formatPrice } = useApp();
  const isGame = game.category === "game";
  const startPrice = game.packages.reduce((min, cur) => (cur.price < min ? cur.price : min), game.packages[0]?.price || 0.99);

  return (
    <div
      onClick={() => onSelect(game)}
      id={`game-card-${game.id}`}
      className="group bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
    >
      {/* Img frame aspect-video custom design */}
      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative select-none shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
        
        <div className="absolute top-2 left-2 z-20 flex gap-1">
          {game.popular && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide shadow">
              HOT
            </span>
          )}
          <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide shadow ${
            isGame ? "bg-indigo-600" : "bg-emerald-600"
          }`}>
            {isGame ? "GAME" : "GP CARD"}
          </span>
        </div>

        {/* Deliver time badge at Top right */}
        <div className="absolute top-2 right-2 z-20">
          <span className="flex items-center gap-0.5 bg-slate-950/80 text-emerald-400 font-bold font-mono text-[9px] uppercase px-1.5 py-0.5 rounded backdrop-blur-sm border border-emerald-500/20">
            <Zap size={9} className="fill-emerald-400" />
            12s
          </span>
        </div>

        <img
          src={game.image}
          alt={game.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 opacity-70 group-hover:opacity-100"
        />
        
        {/* Play Icon hover popup overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 scale-90 group-hover:scale-100 transition-transform">
            <Play size={14} className="fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info details */}
      <div className="flex flex-col gap-1 mt-2.5 flex-1 justify-between">
        <div>
          <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {game.name}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block leading-snug line-clamp-1">
            {game.slogan}
          </span>
        </div>

        <div className="flex items-end justify-between mt-2 pt-2.5 border-t border-slate-800/60">
          <div className="text-left font-mono leading-none">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-sans block mb-1">Price</span>
            <span className="text-indigo-400 font-mono text-xs font-extrabold">{formatPrice(startPrice)}+</span>
          </div>
          
          <button
            id={`btn-topup-${game.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(game);
            }}
            className="w-8 h-8 rounded-lg bg-slate-700/60 border border-slate-700/55 group-hover:bg-indigo-600 text-white group-hover:border-indigo-600 transition-all flex items-center justify-center"
            title="Configure Recharge Pack"
          >
            <svg className="w-4 h-4 text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
