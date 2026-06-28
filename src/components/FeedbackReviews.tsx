import React, { useState } from "react";
import { Review } from "../types";
import { LATEST_REVIEWS } from "../data/gameData";
import { Star, ShieldCheck, Heart, Sparkles, Send } from "lucide-react";

export default function FeedbackReviews() {
  const [reviews, setReviews] = useState<Review[]>(LATEST_REVIEWS);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [gameSelection, setGameSelection] = useState("Free Fire");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert("Please provide a name and feedback comment.");
      return;
    }

    const newReview: Review = {
      id: "r-" + Math.random().toString(36).substr(2, 9),
      username: name.trim(),
      avatar: `https://images.unsplash.com/photo-${[
        "1535713875002-d1d0cf377fde",
        "1494790108377-be9c29b29330",
        "1599566150163-29194dcaad36",
        "1507003211169-0a1dd7228f2d"
      ][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&w=40&h=40`,
      rating,
      gameName: gameSelection,
      comment: comment.trim(),
      date: "Just now",
      verified: true
    };

    setReviews(prev => [newReview, ...prev]);
    setName("");
    setComment("");
    alert("Thank you! Your verified gamer feedback was recorded in Linzo Store.");
  };

  return (
    <div className="space-y-6">
      
      {/* Overview ratings and submit form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Cumulative score */}
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-white text-base">Gamer Trust Ratings</h3>
            <p className="text-xs text-gray-400 mt-1">Verified checkout feedback from our gaming community.</p>
            
            <div className="flex items-center gap-4 py-4">
              <span className="text-5xl font-black text-white font-mono">4.9</span>
              <div>
                <div className="flex gap-0.5 text-amber-400">
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                </div>
                <span className="text-xs text-gray-400 font-bold font-mono">1,489 Verified reviews</span>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {[
                { stars: "5 Stars", pct: "93%" },
                { stars: "4 Stars", pct: "6%" },
                { stars: "3 Stars", pct: "1%" }
              ].map((bar) => (
                <div key={bar.stars} className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <span className="w-12">{bar.stars}</span>
                  <div className="flex-1 bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: bar.pct }} />
                  </div>
                  <span className="w-8 text-right font-bold text-white">{bar.pct}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 p-3 rounded-lg text-[11px] text-gray-400 mt-5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Anti-spam review system checks verified player character ID.</span>
          </div>
        </div>

        {/* Submit Review Form */}
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-indigo-400 animate-pulse-slow" />
            Submit Your Feedback Review
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Gamer Handle</label>
                <input
                  type="text"
                  placeholder="e.g. Shakib_77"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-750 border-slate-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500/50 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Game Subject</label>
                <select
                  value={gameSelection}
                  onChange={(e) => setGameSelection(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg py-2 px-2 text-xs focus:outline-none focus:border-indigo-500/50 text-white"
                >
                  <option value="Free Fire">Free Fire</option>
                  <option value="PUBG Mobile">PUBG Mobile</option>
                  <option value="Mobile Legends">Mobile Legends</option>
                  <option value="Clash of Clans">Clash of Clans</option>
                  <option value="Valorant">Valorant</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Stars Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star size={16} className={star <= rating ? "fill-amber-500" : ""} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-400 font-mono">Verified Gamer badge auto-attached</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Your Honest Feedback</label>
              <textarea
                placeholder="How speedy was your diamond delivery? Happy with rates?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500/50 text-white resize-none"
              />
            </div>

            <button
              id="submit-review-btn"
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all pointer-events-auto cursor-pointer"
            >
              Post Feedback
              <Send size={11} />
            </button>
          </form>
        </div>

      </div>

      {/* Reviews feed */}
      <div className="space-y-3">
        <h4 className="font-display font-extrabold text-white text-base">Verified Feed</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reviews.map((rv) => (
            <div key={rv.id} className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-between font-sans">
              <div>
                <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <img src={rv.avatar} alt={rv.username} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover" />
                    <div>
                       <span className="font-bold text-white text-xs block leading-tight">{rv.username}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{rv.date}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase py-0.5 px-1.5 rounded tracking-wide border border-emerald-500/10 flex items-center gap-0.5">
                    <ShieldCheck size={9} />
                    Verified
                  </span>
                </div>

                <div className="flex gap-0.5 text-amber-500 mb-2">
                  {Array.from({ length: rv.rating }).map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-300 text-xs leading-normal font-medium italic">"{rv.comment}"</p>
              </div>

              <div className="text-[10px] text-slate-500 mt-4 pt-2 border-t border-slate-800 uppercase font-semibold font-mono flex items-center justify-between">
                <span>Top-up item:</span>
                <span className="text-indigo-400">{rv.gameName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
