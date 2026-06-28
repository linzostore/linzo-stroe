import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, Terminal, ToggleLeft, ToggleRight, AlertTriangle, Play, RefreshCw, Zap, Bell, Check, Award } from "lucide-react";

export default function SimulationConsole() {
  const { orders, updateOrderStatus, addNotification, user } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Track pending orders
  const activeOrders = orders.filter(o => ["pending", "paid", "processing"].includes(o.status));

  const triggerFlashSale = () => {
    addNotification(
      "🔥 Flash Weekend Coupon Live!",
      "Save another flat 25% on standard PUBG & Free Fire coins bundles. Paste Checkout Coupon: VIPREWARDS",
      "sale"
    );
  };

  const promoteTier = () => {
    addNotification(
      "🏆 Loyalty Point Multiplier Booster!",
      `Mihimitha Gamer tier was promoted manually! Enjoy extra Coins bonuses on all checkout orders in store today.`,
      "loyalty"
    );
  };

  const advanceOrderState = (orderId: string, currentStatus: string) => {
    if (currentStatus === "pending") {
      updateOrderStatus(orderId, "processing");
    } else if (currentStatus === "processing") {
      updateOrderStatus(orderId, "completed");
    } else {
      updateOrderStatus(orderId, "completed");
    }
  };

  const cancelOrderPlay = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled");
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 select-none">
      
      {/* Mini state button */}
      {!isOpen ? (
        <button
          id="open-sim-console-btn"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-brand text-white border border-indigo-400/20 py-2.5 px-4 rounded-full font-bold text-xs shadow-xl active-glow hover:scale-105 active:translate-y-px transition-all cursor-pointer"
        >
          <Terminal size={14} className="animate-pulse" />
          <span>Linzo Demo Panel</span>
          {activeOrders.length > 0 && (
            <span className="w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold text-white leading-none">
              {activeOrders.length}
            </span>
          )}
        </button>
      ) : (
        <div className="w-[300px] bg-slate-950/95 border border-indigo-500/20 rounded-2xl p-4 shadow-2xl space-y-3 font-sans">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
              <Terminal size={13} />
              <span>Simulation & Demo Console</span>
            </div>
            <button
              id="close-sim-console-btn"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white transition-all text-xs font-bold px-1.5 py-0.5 hover:bg-white/5 rounded"
            >
              Close
            </button>
          </div>

          <p className="text-[10px] text-gray-400 leading-normal">
            Test the live push notification flows of **Order Status Updates**, **Flash Sales**, and **Loyalty Multipliers** here.
          </p>

          {/* Quick Triggers */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Broadcasting Triggers</span>
            
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="sim-btn-flash-sale"
                onClick={triggerFlashSale}
                className="py-1.5 px-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 border border-white/5 transition-all text-left truncate"
              >
                <Zap size={10} className="text-amber-400 fill-amber-400" />
                <span>Simulate Flash Sale</span>
              </button>

              <button
                id="sim-btn-tier-promo"
                onClick={promoteTier}
                className="py-1.5 px-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 border border-white/5 transition-all text-left truncate"
              >
                <Award size={10} className="text-indigo-400 fill-indigo-400" />
                <span>Loyalty Booster</span>
              </button>
            </div>
          </div>

          {/* Core orders advancement panel */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Manage Active Orders ({activeOrders.length})</span>
            
            {activeOrders.length === 0 ? (
              <div className="text-center py-4 bg-white/[0.02] border border-white/5 rounded-lg text-[10px] text-gray-500">
                No active orders queue. Place an order inside the Top-up modal to test status notifications!
              </div>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto no-scrollbar pr-1">
                {activeOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-[10px] space-y-1.5 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="font-bold text-yellow-500">{order.id}</span>
                      <span className="text-gray-400 text-right uppercase bg-white/5 px-1 py-0.2 rounded font-semibold">{order.status}</span>
                    </div>
                    
                    <div className="text-white leading-normal">
                      <strong>{order.gameName}</strong> &middot; {order.packageName}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        id={`sim-advance-${order.id}`}
                        onClick={() => advanceOrderState(order.id, order.status)}
                        className="flex-1 py-1 px-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-extrabold uppercase text-center transition-all flex items-center justify-center gap-0.5"
                      >
                        <RefreshCw size={8} className="animate-spin-slow" />
                        <span>Advance Stage</span>
                      </button>
                      <button
                        id={`sim-cancel-${order.id}`}
                        onClick={() => cancelOrderPlay(order.id)}
                        className="py-1 px-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-[9px] font-extrabold uppercase text-center transition-all flex items-center justify-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[8px] text-gray-500 text-center font-mono pt-1.5 border-t border-white/5">
            LINZO Testbed Dashboard Integration
          </div>
        </div>
      )}
    </div>
  );
}
