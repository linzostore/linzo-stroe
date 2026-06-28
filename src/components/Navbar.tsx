import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Bell, Coins, LogOut, Menu, X, Award, ShoppingBag, ShieldCheck, Gamepad2, Settings, Layers, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, notifications, markAllNotificationsRead, clearNotifications, resetUserProgress, currency, toggleCurrency, theme, toggleTheme } = useApp();
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = () => {
    setShowNotifDrawer(true);
    markAllNotificationsRead();
  };

  const navItems = [
    { id: "home", label: "Store", icon: Gamepad2 },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "loyalty", label: "Loyalty Club", icon: Award },
    { id: "workspace", label: "Linzo Hub", icon: Layers },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum": return "from-indigo-500 to-purple-600 shadow-indigo-500/20";
      case "Gold": return "from-amber-400 to-amber-600 shadow-amber-500/20";
      case "Silver": return "from-slate-400 to-slate-600 shadow-slate-500/20";
      default: return "from-orange-600 to-red-600 shadow-orange-500/20";
    }
  };

  return (
    <>
      <nav id="app-navbar" className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              id="mobile-menu-btn"
              onClick={() => setShowMobileMenu(true)} 
              className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
            >
              <Menu size={22} />
            </button>
            <div 
              onClick={() => setActiveTab("home")} 
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl tracking-tighter group-hover:scale-105 transition-all duration-300">
                LS
              </div>
              <div>
                <span className="font-display font-black text-lg sm:text-xl tracking-widest text-white">
                  LINZO<span className="text-indigo-400 ml-1 font-sans">STORE</span>
                </span>
                <p className="text-[9px] font-mono tracking-widest text-slate-500 font-semibold -mt-1 hidden sm:block">HIGH DENSITY DIRECT</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-indigo-400 animate-pulse-slow" : "text-slate-400"} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Actions Left to Right: Loyalty Coins Balance | Notifications | Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Currency Converter Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl shadow-inner select-none">
              <button
                id="btn-currency-usd"
                onClick={() => currency !== "USD" && toggleCurrency()}
                className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                  currency === "USD"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                USD
              </button>
              <button
                id="btn-currency-bdt"
                onClick={() => currency !== "BDT" && toggleCurrency()}
                className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                  currency === "BDT"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                BDT
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-inner hover:scale-105 active:scale-95"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
            </button>

            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

            {/* Coins Widget customized to look like High Density "Points Balance" */}
            <button
              id="coins-widget-btn"
              onClick={() => setActiveTab("loyalty")}
              className="flex flex-col items-end text-right hover:opacity-80 transition-all duration-300 cursor-pointer"
            >
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Points Balance</span>
              <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1">
                <Coins size={13} className="text-emerald-400" />
                {user.loyaltyPoints} LZ
              </span>
            </button>

            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

            {/* Notification Badge */}
            <button
              id="notif-badge-btn"
              onClick={handleNotifClick}
              className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-slate-800 transition-all duration-200"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* High Density Premium User Profile Info Card (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 pl-1">
              <div className="text-right">
                <div className="text-sm font-bold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">{user.tier} Member</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-indigo-500 flex items-center justify-center font-bold text-white text-sm select-none">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <button 
                id="reset-state-btn"
                onClick={() => {
                  if (confirm("Reset current simulation state (reloads default mock datasets)?")) {
                    resetUserProgress();
                    setActiveTab("home");
                  }
                }}
                title="Reset simulation data"
                className="p-1 px-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-all"
              >
                <Settings size={14} />
              </button>
            </div>

            {/* Micro logout/settings button for mobile */}
            <button 
                id="mobile-reset-state-btn"
                onClick={() => {
                  if (confirm("Reset current state?")) {
                    resetUserProgress();
                    setActiveTab("home");
                  }
                }}
                className="sm:hidden p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-[#0F172A] border border-slate-800"
              >
                  <Settings size={16} />
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              id="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              id="mobile-nav-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 bg-dark-card border-r border-white/5 p-5 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-brand flex items-center justify-center text-white">
                      <Gamepad2 size={16} />
                    </div>
                    <span className="font-display font-black text-lg tracking-tight text-white">
                      LINZO <span className="text-primary font-sans font-medium">STORE</span>
                    </span>
                  </div>
                  <button 
                    id="close-mobile-menu"
                    onClick={() => setShowMobileMenu(false)} 
                    className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User card Mobile */}
                <div className="bg-white/5 rounded-xl p-4 my-6 border border-white/5">
                  <div className="text-xs text-gray-400 mb-1">Signed In Account</div>
                  <div className="font-bold text-white text-sm">{user.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono overflow-hidden text-ellipsis mb-3">{user.email}</div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs text-gray-400 font-medium">Tier Rating:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white bg-gradient-to-r ${getTierColor(user.tier)}`}>
                      {user.tier}
                    </span>
                  </div>
                </div>

                {/* Mobile Preferences (Currency + Theme) */}
                <div className="flex gap-2.5 items-center justify-between mb-6 bg-white/5 border border-white/5 p-2 rounded-xl">
                  {/* Currency Converter */}
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl shadow-inner select-none">
                    <button
                      id="mobile-btn-currency-usd"
                      onClick={() => currency !== "USD" && toggleCurrency()}
                      className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                        currency === "USD"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      USD
                    </button>
                    <button
                      id="mobile-btn-currency-bdt"
                      onClick={() => currency !== "BDT" && toggleCurrency()}
                      className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                        currency === "BDT"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      BDT
                    </button>
                  </div>

                  {/* Theme Toggle */}
                  <button
                    id="mobile-btn-theme-toggle"
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer select-none"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun size={13} className="text-amber-400" />
                        <span className="text-[10px] font-black tracking-wider uppercase">Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={13} className="text-indigo-400" />
                        <span className="text-[10px] font-black tracking-wider uppercase">Dark</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Dynamic Links list */}
                <div className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`mobile-nav-${item.id}`}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowMobileMenu(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset session action helper footer */}
              <div className="pt-6 border-t border-white/10">
                <button
                  id="mobile-data-reset"
                  onClick={() => {
                    if (confirm("Reset current simulator database logs?")) {
                      resetUserProgress();
                      setActiveTab("home");
                      setShowMobileMenu(false);
                    }
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 font-semibold rounded-lg hover:bg-red-500/10 transition-all border border-red-500/20"
                >
                  <Settings size={18} />
                  Reset Store State
                </button>
                <div className="mt-4 text-center text-[10px] text-gray-500">
                  Secure checkout secure payment systems &middot; v2.0
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* In-app Notification Drawer Inbox overlay (Side slide-in) */}
      <AnimatePresence>
        {showNotifDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              id="notif-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifDrawer(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />
            {/* Cabinet Drawer Panel */}
            <motion.div
              id="notif-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[380px] z-50 bg-dark-bg/95 md:bg-dark-card border-l border-white/10 p-5 shadow-2xl flex flex-col h-full"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <h3 className="font-display font-extrabold text-white text-lg">Notifications Inbox</h3>
                </div>
                <button 
                  id="close-notif-drawer"
                  onClick={() => setShowNotifDrawer(false)} 
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <Bell size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="font-medium">All caught up here!</p>
                    <p className="text-xs text-gray-600 mt-1">No alerts waiting. Orders status will notify instantly here.</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-4 rounded-xl border transition-all text-xs ${
                        notif.read 
                          ? "bg-white/[0.02] border-white/5" 
                          : "bg-primary/5 active-glow border-primary/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold ${
                          notif.type === 'sale' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          notif.type === 'order' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          notif.type === 'loyalty' ? 'bg-indigo-brand/10 text-indigo-brand border border-indigo-brand/20' :
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {notif.type === 'sale' ? 'Flash Sale' : notif.type === 'order' ? 'Order Update' : notif.type === 'loyalty' ? 'Rewards' : 'System'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{notif.date}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mb-1">{notif.title}</h4>
                      <p className="text-gray-300 leading-relaxed font-sans">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="pt-4 border-t border-white/10 flex gap-2">
                  <button
                    id="clear-notif-btn"
                    onClick={clearNotifications}
                    className="flex-1 py-2 text-center text-xs text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all font-semibold border border-white/5"
                  >
                    Clear All
                  </button>
                  <button
                    id="close-drawer-footer-btn"
                    onClick={() => setShowNotifDrawer(false)}
                    className="flex-1 py-2 text-center text-xs text-white bg-primary hover:bg-primary-dark font-bold rounded-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
