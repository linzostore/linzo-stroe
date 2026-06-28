import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Award, Coins, HelpCircle, ShieldCheck, CheckCircle2, Ticket, Sparkles, Star, Zap, Calendar, Clock } from "lucide-react";
import { motion } from "motion/react";

interface RewardItem {
  id: string;
  title: string;
  points: number;
  value: string;
  description: string;
  badge?: string;
}

const REWARDS: RewardItem[] = [
  { id: "rw_1", title: "Copper Coupon $0.50 discount key", points: 100, value: "$0.50", description: "Convert 100 coins into custom Checkout discount. Instantly valid on next purchase.", badge: "Popular" },
  { id: "rw_2", title: "Silver Coupon $1.00 discount key", points: 200, value: "$1.00", description: "Redeem 200 coins for $1.00 off. Perfect for intermediate diamond packages.", badge: "Hot Redempt" },
  { id: "rw_3", title: "Golden Vault $2.50 discount card", points: 450, value: "$2.50", description: "Redeem 450 coins for $2.50 flat coupon off. Best value for high-tier game recharges.", badge: "Best Value" },
  { id: "rw_4", title: "Weekly Lite Membership Code", points: 500, value: "VOUCHER", description: "Unlock free Free Fire weekly lite code using 500 Coins. Code generated in email history." }
];

export default function LoyaltyDashboard() {
  const { user, claimLoyaltyReward, claimDailyBonus } = useApp();
  const [successClaim, setSuccessClaim] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const lastClaimTime = user.lastDailyClaim ? new Date(user.lastDailyClaim).getTime() : 0;
      const now = Date.now();
      const COOLDOWN_MS = 24 * 60 * 60 * 1000;
      const diff = COOLDOWN_MS - (now - lastClaimTime);
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [user.lastDailyClaim]);

  const formatTimeLeft = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getBonusAmount = () => {
    switch (user.tier) {
      case "Platinum": return 40;
      case "Gold": return 30;
      case "Silver": return 25;
      default: return 20;
    }
  };

  const handleClaimBonus = () => {
    if (timeLeft > 0) return;
    claimDailyBonus(getBonusAmount());
  };

  // Math for points levels
  const getPointsProgress = () => {
    let nextTier = "Gold";
    let requiredPoints = 500;
    let baseTierPoints = 0;

    if (user.tier === "Platinum") {
      return { percentage: 100, nextTier: "MAX LEVEL REACHED", pointsLeft: 0 };
    } else if (user.tier === "Gold") {
      nextTier = "Platinum";
      requiredPoints = 1000;
      baseTierPoints = 500;
    } else if (user.tier === "Silver") {
      nextTier = "Gold";
      requiredPoints = 500;
      baseTierPoints = 150;
    } else {
      nextTier = "Silver";
      requiredPoints = 150;
      baseTierPoints = 0;
    }

    const currentProgressPoints = user.totalSpent * 10; // 1 USD = 10 rank points
    const pointsNeeded = requiredPoints - currentProgressPoints;
    const progressPercent = Math.min(
      100,
      Math.max(0, ((currentProgressPoints - baseTierPoints) / (requiredPoints - baseTierPoints)) * 100)
    );

    return { percentage: progressPercent, nextTier, pointsLeft: Math.ceil(pointsNeeded) };
  };

  const { percentage, nextTier, pointsLeft } = getPointsProgress();

  const handleRedeem = (item: RewardItem) => {
    if (user.loyaltyPoints < item.points) {
      alert(`Oops! You need ${item.points - user.loyaltyPoints} more Linzo Coins to claim this reward.`);
      return;
    }
    
    const status = claimLoyaltyReward(item.points, item.title);
    if (status) {
      setSuccessClaim(item.title);
      setTimeout(() => setSuccessClaim(null), 3500);
    }
  };

  const getTierColorClass = (tier: string) => {
    switch (tier) {
      case "Platinum": return "from-indigo-400 via-purple-500 to-pink-500 text-white active-glow border-pink-500/20";
      case "Gold": return "from-amber-400 to-yellow-600 text-white border-amber-500/20";
      case "Silver": return "from-slate-400 to-slate-600 text-white border-slate-500/20";
      default: return "from-orange-600 to-red-600 text-white border-orange-500/20";
    }
  };

  return (
    <div id="loyalty-dashboard" className="space-y-6">
      
      {/* Dynamic Header Section */}
      <div className={`p-6 rounded-2xl bg-gradient-to-tr ${getTierColorClass(user.tier)} border glow-card flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden`}>
        {/* Abstract shapes inside card */}
        <div className="absolute top-0 right-0 w-1/3 h-full radial-glow opacity-30 select-none" />

        <div className="space-y-3 z-10 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="bg-black/25 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full border border-white/10 flex items-center gap-1">
              <Award size={11} className="text-yellow-300" />
              Linzo Rewards Club Status
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight uppercase">
            {user.tier} Club Member
          </h2>
          <p className="text-white/80 text-xs max-w-lg mt-1 font-medium">
            You enjoy 
            <span className="font-bold text-yellow-300 mx-1">
              {user.tier === 'Platinum' ? '1.5x Multiplier' : user.tier === 'Gold' ? '1.3x Multiplier' : user.tier === 'Silver' ? '1.15x Multiplier' : '1.0x Base'}
            </span> 
            points boost on all game top-ups checkout instantly.
          </p>

          {/* Rank Points Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-mono text-white/90">
              <span className="font-sans">Tier Progress</span>
              <span>Next Rank: {nextTier}</span>
            </div>
            <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-yellow-300 to-emerald-400 h-full transition-all duration-1000" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            {pointsLeft > 0 && (
              <p className="text-[10px] font-medium font-mono text-white/70">
                Spend another <span className="font-bold text-yellow-300">${(pointsLeft / 10).toFixed(2)}</span> to auto-unlock {nextTier} tier!
              </p>
            )}
          </div>
        </div>

        {/* Level Banner right corner */}
        <div className="bg-black/40 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center font-mono text-center min-w-[150px] z-10 shadow-lg">
          <Coins size={36} className="text-yellow-400 animate-pulse-slow mb-1" />
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans">Accumulated</span>
          <span className="text-2xl font-black text-yellow-400">{user.loyaltyPoints}</span>
          <span className="text-[10px] text-yellow-500 font-sans tracking-wide">Linzo Coins</span>
        </div>
      </div>

      {/* Daily Login Bonus Claim Card */}
      <div id="daily-bonus-card" className="premium-glass-panel rounded-2xl border border-slate-800 p-5 bg-gradient-to-r from-indigo-950/20 to-slate-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row z-10">
          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 border ${
            timeLeft === 0 
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" 
              : "bg-slate-800/80 text-slate-500 border-slate-700/50"
          }`}>
            <Calendar size={22} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                Daily Login Bonus
              </h3>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                timeLeft === 0 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse" 
                  : "bg-slate-800 text-slate-500 border-slate-700/40"
              }`}>
                {timeLeft === 0 ? "Ready to Claim" : "Claimed Today"}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md font-sans">
              Grab free Linzo Coins once every 24 hours. Your current tier multiplier unlocks a premium boost of <span className="text-amber-400 font-extrabold">+{getBonusAmount()} LZ Coins</span>!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0 z-10">
          {timeLeft > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950/40 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 w-full sm:w-auto justify-center select-none">
              <Clock size={13} className="text-indigo-400" />
              <span>Resets in: <strong className="text-white font-black">{formatTimeLeft(timeLeft)}</strong></span>
            </div>
          )}
          
          <button
            id="btn-claim-daily-bonus"
            onClick={handleClaimBonus}
            disabled={timeLeft > 0}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider select-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer pointer-events-auto ${
              timeLeft === 0 
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98]" 
                : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {timeLeft === 0 ? (
              <>
                <Sparkles size={13} className="animate-spin-slow" />
                <span>Claim +{getBonusAmount()} Coins</span>
              </>
            ) : (
              <span>Bonus Claimed</span>
            )}
          </button>
        </div>
      </div>

      {/* Benefits checklist comparison matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 space-y-3.5">
          <h3 className="font-display font-medium text-sm text-white flex items-center gap-2">
            <Star size={16} className="text-indigo-400" />
            Club Tier Multiplier Guidelines
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {[
              { rank: "Bronze Club", spent: "$0+", boost: "1.0x Base point accrual" },
              { rank: "Silver Club", spent: "$25+", boost: "1.15x extra points bonus" },
              { rank: "Gold Club", spent: "$100+", boost: "1.3x heavy premium multiplier" },
              { rank: "Platinum Club", spent: "$200+", boost: "1.5x VIP maximum multiplier + VIP Coupons" }
            ].map((t) => {
              const isCurrent = user.tier === t.rank.split(" ")[0];
              return (
                <div 
                  key={t.rank}
                  className={`flex justify-between items-center py-2 px-3 rounded-lg border transition-all ${
                    isCurrent 
                      ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400" 
                      : "bg-slate-900/45 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-indigo-400' : 'bg-slate-705'}`} />
                    <span className="font-bold">{t.rank}</span>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="font-sans text-slate-500 mr-2">{t.spent}</span>
                    <span className={isCurrent ? "font-bold text-indigo-400" : "text-slate-350"}>{t.boost}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-medium text-sm text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400" />
              Linzo Rewards Guarantee
            </h3>
            <p className="text-xs text-slate-400 leading-normal font-sans pt-2">
              Linzo Coins are credited to your gamer account immediately upon order completion. Use coins to generate checkout vouchers, or join future raffle items for direct game keys delivery.
            </p>
            
            <div className="space-y-2.5 pt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle2 size={13} className="text-indigo-400" />
                <span>Zero limits: Redeem as many vouchers as you qualify for</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle2 size={13} className="text-indigo-400" />
                <span>No expiry: Your Coins remain valid through the seasons</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle2 size={13} className="text-indigo-400" />
                <span>Dual checkouts: Redeem via automated bKash or manually</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center pt-4 border-t border-slate-800 mt-4">
            Security compliance &middot; Anti-fraud checking system active
          </div>
        </div>

      </div>

      {/* Rewards swap grid */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display font-extrabold text-white text-base">Claim Rewards Coupons</h3>
          <span className="text-xs text-slate-400 font-semibold">Spend your Linzo Coins to swap for keys</span>
        </div>

        {successClaim && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black rounded-xl text-center animate-pulse">
            🎉 Successfully redeemed "{successClaim}". Discount is queued into your next checkout!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REWARDS.map((rw) => {
            const canClaim = user.loyaltyPoints >= rw.points;
            return (
              <div 
                key={rw.id}
                id={`reward-claim-${rw.id}`}
                className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-between hover:border-indigo-500/30 duration-300 transition-all font-sans"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{rw.value === "VOUCHER" ? "🎟️" : "💵"}</span>
                    {rw.badge && (
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                        {rw.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{rw.title}</h4>
                  <p className="text-slate-400 text-xs leading-normal font-medium mb-3 min-h-[32px]">{rw.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-3">
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <Coins size={12} className="text-amber-400" />
                    <span className="font-extrabold text-amber-400">{rw.points}</span>
                    <span className="text-[10px] text-slate-500 font-sans">Coins</span>
                  </div>
                  <button
                    id={`btn-swap-${rw.id}`}
                    onClick={() => handleRedeem(rw)}
                    disabled={!canClaim}
                    className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider select-none transition-all ${
                      canClaim 
                        ? "bg-amber-500 hover:bg-amber-600 text-black cursor-pointer shadow-lg shadow-amber-500/5 hover:scale-[1.01]" 
                        : "bg-slate-900/50 text-slate-500 border border-slate-800 cursor-not-allowed"
                    }`}
                  >
                    Swap Coins
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
