import React, { useState } from "react";
import { Order } from "../types";
import { useApp } from "../context/AppContext";
import { ListOrdered, Clock, CheckCircle2, AlertCircle, Search, Calendar, Landmark, User, Zap, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function OrderHistory() {
  const { orders, formatPrice } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "processing": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "paid": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border border-red-500/20";
      default: return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/25"; // pending
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "completed": return "Delivered";
      case "processing": return "Recharging";
      case "paid": return "Validation passed";
      case "cancelled": return "Cancelled & Refunded";
      default: return "Awaiting Validation";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "completed": return CheckCircle2;
      case "processing": return RefreshCw;
      case "cancelled": return X;
      default: return Clock;
    }
  };

  const filteredOrders = orders.filter(
    order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.playerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="order-history-tab" className="space-y-4">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight uppercase flex items-center gap-2">
            <ListOrdered size={20} className="text-primary animate-pulse-slow" />
            Transaction history & tracking
          </h2>
          <span className="text-xs text-slate-400 font-medium font-sans">
            Track real-time status updates of active and historic orders.
          </span>
        </div>

        {/* Query Filter */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Game ID, TrxID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-850 border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500/50 text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Orders Grid/Table info */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-24 bg-slate-800/40 rounded-xl border border-slate-700/50">
          <Clock size={40} className="mx-auto text-slate-600 mb-2" />
          <p className="font-bold text-white text-sm">No transactions matches found</p>
          <p className="text-xs text-slate-500 mt-1">Make a game diamond top-up to populate transaction history!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <div
                key={order.id}
                id={`order-row-${order.id}`}
                onClick={() => setSelectedOrder(order)}
                className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Game / Details */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-750 border-slate-850 border-slate-700 bg-slate-900 select-none">
                    <img src={order.gameImage} alt={order.gameName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{order.gameName}</span>
                      <span className="font-mono text-[9px] text-slate-400 bg-slate-900/60 border border-slate-800 px-1.5 py-0.5 rounded tracking-wide font-semibold">
                        {order.id}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-455 text-indigo-400 font-bold">{order.packageName}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-0.5 font-sans"><User size={10} /> ID: <strong>{order.playerId}</strong></span>
                      <span>&bull;</span>
                      <span className="capitalize font-sans bg-slate-900/40 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-300">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t border-slate-800 pt-2 sm:pt-0 sm:border-0">
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 sm:text-right">
                    <Calendar size={10} />
                    {order.date}
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-black text-white">{formatPrice(order.price)}</span>
                    <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 leading-none ${getStatusBadgeClass(order.status)}`}>
                      <StatusIcon size={9} className={`${order.status === 'processing' ? 'animate-spin' : ''}`} />
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Timeline Modal on row click */}
      <AnimatePresence>
        {selectedOrder && (
          <div id="order-timeline-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl relative"
            >
              <button
                id="close-order-timeline"
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850/50 transition-all pointer-events-auto cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="font-display font-semibold text-white text-base pb-3 border-b border-slate-800 uppercase">
                Detailed Order Status Tracker
              </h3>

              <div className="space-y-4 py-4">
                
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950/40 border border-slate-800 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-500 block">TRACKING ID</span>
                    <span className="text-white font-extrabold">{selectedOrder.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GAME PROVIDER</span>
                    <span className="text-white font-extrabold">{selectedOrder.gameName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">RECIPIENT PAYLOAD</span>
                    <span className="text-white font-bold">{selectedOrder.playerId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CHECKOUT PRICE</span>
                    <span className="text-indigo-400 font-black">{formatPrice(selectedOrder.price)}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-800">
                    <span className="text-slate-500 block uppercase">Gateway reference (TrxID)</span>
                    <span className="text-yellow-300 font-bold">{selectedOrder.paymentMethod} &bull; {selectedOrder.transactionId}</span>
                  </div>
                </div>

                {/* High fidelity vertical timeline */}
                <div className="space-y-4 relative pl-5 border-l border-slate-800 ml-2">
                  
                  {/* Step 1: Created */}
                  <div className="relative">
                    <span className="absolute -left-[25px] top-0.5 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Order Placed</h4>
                      <p className="text-[10px] text-slate-455 text-slate-400">{selectedOrder.date}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Checked out securely using automated {selectedOrder.paymentMethod} gateway.</p>
                    </div>
                  </div>

                  {/* Step 2: Paid & Verified */}
                  <div className="relative">
                    <span className={`absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border-4 border-slate-900 ${
                      ["paid", "processing", "completed"].includes(selectedOrder.status)
                        ? "bg-emerald-500"
                        : "bg-slate-800"
                    }`} />
                    <div>
                      <h4 className={`font-bold text-xs ${["paid", "processing", "completed"].includes(selectedOrder.status) ? 'text-white' : 'text-slate-600'}`}>
                        SMS TrxID Validation
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Automated safety checks validated transaction ID matching.</p>
                    </div>
                  </div>

                  {/* Step 3: Loading diamonds / processing */}
                  <div className="relative">
                    <span className={`absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border-4 border-slate-900 ${
                      ["processing", "completed"].includes(selectedOrder.status)
                        ? "bg-emerald-500"
                        : "bg-slate-800"
                    }`} />
                    <div>
                      <h4 className={`font-bold text-xs ${["processing", "completed"].includes(selectedOrder.status) ? 'text-white' : 'text-slate-600'}`}>
                        Recharge Loading Queue
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Authorized gamer server loads currency directly into Character ID.</p>
                    </div>
                  </div>

                  {/* Step 4: Completed */}
                  <div className="relative">
                    <span className={`absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border-4 border-slate-900 ${
                      selectedOrder.status === "completed"
                        ? "bg-emerald-500 active-glow animate-pulse-slow"
                        : "bg-slate-800"
                    }`} />
                    <div>
                      <h4 className={`font-bold text-xs ${selectedOrder.status === "completed" ? 'text-indigo-400' : 'text-slate-600'}`}>
                        Delivery Dispatched Successful
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Recharge is active inside game lobby. Thank you for using LINZO!</p>
                    </div>
                  </div>

                </div>

              </div>
              
              <button
                id="close-order-history-details-btn"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 text-center text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white rounded-xl border border-slate-700 transition-all mt-1 uppercase pointer-events-auto cursor-pointer"
              >
                Close Tracking
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
