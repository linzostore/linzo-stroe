import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import BannerSlider from "./components/BannerSlider";
import GameCard from "./components/GameCard";
import TopUpModal from "./components/TopUpModal";
import LoyaltyDashboard from "./components/LoyaltyDashboard";
import OrderHistory from "./components/OrderHistory";
import FeedbackReviews from "./components/FeedbackReviews";
import SimulationConsole from "./components/SimulationConsole";
import WorkspaceHub from "./components/WorkspaceHub";
import { GAMES_DATA } from "./data/gameData";
import { Game, Order } from "./types";
import { Search, Sparkles, ShieldCheck, Heart, Smartphone, HelpCircle, Gamepad2, Award, ShoppingBag, X, Star, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function StoreContent() {
  const { 
    activeModalGame, 
    setActiveModalGame, 
    activeToast, 
    dismissToast,
    addNotification,
    formatPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "game" | "giftcard">("all");
  const [selectedSuccessOrder, setSelectedSuccessOrder] = useState<Order | null>(null);

  // Search/Filter math
  const filteredGames = GAMES_DATA.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.slogan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || game.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOrderCreatedSuccess = (order: Order) => {
    setSelectedSuccessOrder(order);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      
      {/* Background radial soft light gradient effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] radial-glow pointer-events-none z-0" />

      {/* Global Toast Alert Notification Panel */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            id="global-toast-notification"
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-[90vw] premium-glass-panel rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-indigo-500/20 active-glow flex items-start gap-3 select-none"
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              activeToast.type === 'sale' ? 'bg-amber-500/10 text-amber-400' :
              activeToast.type === 'order' ? 'bg-emerald-500/10 text-emerald-400' :
              activeToast.type === 'loyalty' ? 'bg-indigo-brand/10 text-indigo-brand' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              {activeToast.type === 'sale' ? <Sparkles size={18} /> :
               activeToast.type === 'order' ? <ShoppingBag size={18} /> :
               activeToast.type === 'loyalty' ? <Award size={18} /> :
               <Bell size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Linzo Push Alert</span>
                <span className="text-[9px] bg-indigo-600/10 text-indigo-400 font-bold px-1.5 py-0.2 rounded font-sans uppercase">Live</span>
              </div>
              <h4 className="font-bold text-sm text-white mt-1 leading-snug">{activeToast.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{activeToast.message}</p>
            </div>
            <button 
              id="dismiss-toast-btn"
              onClick={dismissToast} 
              className="text-slate-500 hover:text-white p-0.5 rounded transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Layout Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 z-10 relative">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-8"
            >
              {/* Promo Banners Sliders */}
              <BannerSlider />

              {/* Game Catalogue & Filter Control Segment */}
              <div className="space-y-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <h2 className="font-display font-black text-xl text-white tracking-widest uppercase flex items-center gap-2">
                      <Gamepad2 size={20} className="text-indigo-400 animate-pulse-slow" />
                      Browse Catalogue
                    </h2>
                    <span className="text-xs text-slate-400 font-medium font-sans">
                      Select a game title or voucher to top up in under 60 seconds.
                    </span>
                  </div>

                  {/* Filter segments */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-60 flex items-center bg-[#0B0F1A] border border-slate-700/80 rounded-full px-3.5 py-1.5">
                      <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search games, gift cards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs outline-none w-full text-slate-300 placeholder-slate-500"
                      />
                    </div>

                    {/* Filter categories tabs buttons */}
                    <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto justify-around">
                      {[
                        { id: "all", label: "All Items" },
                        { id: "game", label: "Game UID" },
                        { id: "giftcard", label: "Gift Cards" }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          id={`cat-filter-${cat.id}`}
                          onClick={() => setCategoryFilter(cat.id as any)}
                          className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            categoryFilter === cat.id
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Games card Grid */}
                {filteredGames.length === 0 ? (
                  <div className="text-center py-20 bg-[#111827] rounded-2xl border border-white/5 shadow-2xl">
                    <Search className="mx-auto text-gray-600 mb-2" size={32} />
                    <p className="font-bold text-white text-sm">No Catalogue Items Found</p>
                    <p className="text-xs text-gray-500 mt-1">Try another search filter query e.g. "Free Fire" or "iTunes"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {filteredGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        onSelect={setActiveModalGame} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Community feedback section at bottom of home */}
              <div className="pt-4 border-t border-white/5">
                <FeedbackReviews />
              </div>

            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <OrderHistory />
            </motion.div>
          )}

          {activeTab === "loyalty" && (
            <motion.div
              key="loyalty-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <LoyaltyDashboard />
            </motion.div>
          )}

          {activeTab === "workspace" && (
            <motion.div
              key="workspace-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <WorkspaceHub />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Simulation Controls Console Drawer */}
      <SimulationConsole />

      {/* Footer Section */}
      <footer className="bg-[#0F172A] border-t border-slate-800 py-8 px-4 sm:px-6 mt-12 z-10 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center md:text-left">
            <span className="font-display font-semibold text-slate-300">LINZO STORE</span>
            <p className="mt-1">Inspired by baasiltopup.com &middot; Game Topups & Premium Vouchers Gateways.</p>
          </div>
          <div className="flex gap-4 items-center justify-center">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-indigo-450" />
              Secure 256-Bit SSL check
            </span>
            <span>&bull;</span>
            <span>Created in {currentYear}</span>
          </div>
        </div>
      </footer>

      {/* High Density Scrolling Marquee alert ticker */}
      <footer className="h-8 bg-indigo-600 text-white flex items-center overflow-hidden shrink-0 select-none z-10">
        <div className="animate-marquee px-4 gap-12 text-[10px] uppercase font-bold tracking-widest flex items-center shrink-0">
          <span className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            FLASH SALE: 15% OFF ON GOOGLE PLAY CODES WITH PROMO BOOM777
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            ORDER #L9281 SUCCESSFULLY DELIVERED VIA MOBILE API GATEWAY
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            LOYALTY REWARDS UPDATED: EXTRA BONUS LZ COINS TRIGGERED DAILY
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            FLASH SALE: 15% OFF ON GOOGLE PLAY CODES WITH PROMO BOOM777
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            ORDER #L9281 SUCCESSFULLY DELIVERED VIA MOBILE API GATEWAY
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            LOYALTY REWARDS UPDATED: EXTRA BONUS LZ COINS TRIGGERED DAILY
          </span>
        </div>
      </footer>

      {/* Primary Checkout Modal Overlay */}
      <AnimatePresence>
        {activeModalGame && (
          <TopUpModal 
            game={activeModalGame} 
            onClose={() => setActiveModalGame(null)} 
            onOrderSuccess={handleOrderCreatedSuccess}
          />
        )}
      </AnimatePresence>

      {/* Order Creation Success Congratulations Modal */}
      <AnimatePresence>
        {selectedSuccessOrder && (
          <div id="receipt-success-modal" className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-emerald-500/20 max-w-md w-full p-6 p-7 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center relative overflow-hidden"
            >
              {/* Sparkle burst decoration background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-4 font-mono select-none animate-bounce">
                🎉
              </div>
              <h3 className="font-display font-extrabold text-white text-xl uppercase tracking-tight">Order Placed Successful!</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed px-2 font-medium">
                Thank you! Your deposit matches requirements. Linzo Checkout has queued order <span className="font-bold text-yellow-300 font-mono tracking-wider">{selectedSuccessOrder.id}</span> for character delivery.
              </p>

              {/* Receipt metadata */}
              <div className="bg-black/40 rounded-xl p-4 my-5 border border-white/5 space-y-1.5 font-mono text-left text-[11px] leading-relaxed">
                <p className="flex justify-between">
                  <span className="text-gray-500">Subject Game:</span>
                  <span className="font-bold text-white">{selectedSuccessOrder.gameName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Recharge Pack:</span>
                  <span className="font-bold text-primary">{selectedSuccessOrder.packageName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Character Target:</span>
                  <span className="font-bold text-white uppercase">{selectedSuccessOrder.playerId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Gateway Provider:</span>
                  <span className="font-bold text-white uppercase">{selectedSuccessOrder.paymentMethod}</span>
                </p>
                <p className="flex justify-between border-t border-white/5 pt-1.5 mt-1 text-xs">
                  <span className="text-gray-400 font-sans font-bold">Sum Charged:</span>
                  <span className="font-black text-emerald-400 text-sm">{formatPrice(selectedSuccessOrder.price)}</span>
                </p>
              </div>

              <div className="space-y-2">
                <button
                  id="checkout-success-track-btn"
                  onClick={() => {
                    setSelectedSuccessOrder(null);
                    setActiveTab("orders");
                  }}
                  className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:emerald-button-glow font-black text-xs uppercase text-black tracking-widest rounded-xl transition-all duration-300"
                >
                  Track in Transaction Logs
                </button>
                <button
                  id="checkout-success-shop-btn"
                  onClick={() => setSelectedSuccessOrder(null)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-white/5"
                >
                  Shop More Packages
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StoreContent />
    </AppProvider>
  );
}
