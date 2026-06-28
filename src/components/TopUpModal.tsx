import React, { useState, useEffect } from "react";
import { Game, Package, Coupon, Order } from "../types";
import { useApp } from "../context/AppContext";
import { X, User, HelpCircle, ArrowRight, Check, ShieldCheck, Ticket, Sparkles, Star, Smartphone, Key, Lock, CheckCircle2, History, CreditCard, Coins, AlertTriangle } from "lucide-react";
import { COUPONS_DATA } from "../data/gameData";
import { motion, AnimatePresence } from "motion/react";

interface TopUpModalProps {
  game: Game;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

type CheckoutStep = "details" | "bkash_gateway" | "nagad_gateway" | "manual_verify" | "summary";

export default function TopUpModal({ game, onClose, onOrderSuccess }: TopUpModalProps) {
  const { user, placeOrder, addNotification, formatPrice, currency } = useApp();

  // Core checkout states
  const [playerId, setPlayerId] = useState("");
  const [playerEmail, setPlayerEmail] = useState(user.email || "");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Nagad" | "Rocket" | "Card">("bKash");
  
  // Coupons & Loyalty states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  // Gateway Simulation states
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("details");
  const [gatewayPhone, setGatewayPhone] = useState("");
  const [gatewayOtp, setGatewayOtp] = useState("");
  const [gatewayPin, setGatewayPin] = useState("");
  const [gatewayState, setGatewayState] = useState<"phone" | "otp" | "pin" | "processing" | "success">("phone");
  
  // Manual Verify states
  const [senderNumber, setSenderNumber] = useState("");
  const [transId, setTransId] = useState("");
  const [manualError, setManualError] = useState("");

  // Helper validation
  const [formErrors, setFormErrors] = useState<{ id?: string; email?: string; pkg?: string }>({});

  const isGiftCard = game.category === "giftcard";

  // Pre-fill fields if user changes
  useEffect(() => {
    if (user.phoneNumber) {
      setGatewayPhone(user.phoneNumber.replace(/[^\d]/g, ""));
      setSenderNumber(user.phoneNumber.replace(/[^\d]/g, ""));
    }
  }, [user]);

  // Pricing math
  const getPricingMath = () => {
    if (!selectedPackage) return { subtotal: 0, couponDiscount: 0, loyaltyDiscount: 0, finalPrice: 0, coinsEarned: 0 };
    const subtotal = selectedPackage.price;
    
    // 1. Coupon math
    let couponDiscount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minSpend) {
      couponDiscount = appliedCoupon.discount;
    }

    // 2. Loyalty math - converts 100 points to $0.50 off, maximally covering remaining
    let loyaltyDiscount = 0;
    const maxRedeemablePoints = user.loyaltyPoints;
    if (useLoyaltyPoints && maxRedeemablePoints > 0) {
      // every 100 points = $0.50
      const pointValue = 0.005; 
      const estimatedDiscount = maxRedeemablePoints * pointValue;
      const remainingPrice = Math.max(0, subtotal - couponDiscount);
      loyaltyDiscount = Math.min(estimatedDiscount, remainingPrice);
    }

    const finalPrice = Math.max(0.10, subtotal - couponDiscount - loyaltyDiscount); // Min purchase of $0.10
    const coinsEarned = Math.floor(selectedPackage.pointsEarned * (user.tier === "Platinum" ? 1.5 : user.tier === "Gold" ? 1.3 : user.tier === "Silver" ? 1.15 : 1));

    return { subtotal, couponDiscount, loyaltyDiscount, finalPrice, coinsEarned };
  };

  const { subtotal, couponDiscount, loyaltyDiscount, finalPrice, coinsEarned } = getPricingMath();

  const handleApplyCoupon = () => {
    setCouponError("");
    const codeNormalized = couponCode.trim().toUpperCase();
    const found = COUPONS_DATA.find(c => c.code === codeNormalized);
    if (!found) {
      setCouponError("Invalid coupon code.");
      setAppliedCoupon(null);
      return;
    }
    if (selectedPackage && selectedPackage.price < found.minSpend) {
      setCouponError(`Min purchase of ${formatPrice(found.minSpend)} required for this voucher.`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    addNotification("🎟️ Promo Code Applied", `Code ${found.code} saved you ${formatPrice(found.discount)} on checkout!`, "system");
  };

  const validateDetails = () => {
    const errors: typeof formErrors = {};
    if (!playerId.trim()) {
      errors.id = "Please input player identity / recipient details.";
    } else if (playerId.trim().length < 5) {
      errors.id = "Identity code seems too short.";
    }

    if (game.requiresEmail && !playerEmail.trim()) {
      errors.email = "Support email key delivery is required.";
    }

    if (!selectedPackage) {
      errors.pkg = "Please select a top-up coin amount bundle.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = () => {
    if (!validateDetails() || !selectedPackage) return;

    if (paymentMethod === "bKash") {
      setCheckoutStep("bkash_gateway");
      setGatewayState("phone");
    } else if (paymentMethod === "Nagad") {
      setCheckoutStep("nagad_gateway");
      setGatewayState("phone");
    } else {
      setCheckoutStep("manual_verify");
      setTransId("TRX" + Math.random().toString(36).substr(2, 8).toUpperCase());
    }
  };

  // Simulated Automated Gateway sequence
  const startGatewaySequence = () => {
    if (!gatewayPhone || gatewayPhone.length < 10) {
      alert("Please specify a valid mobile phone number.");
      return;
    }
    setGatewayState("otp");
  };

  const handleVerifyOtp = () => {
    setGatewayState("pin");
  };

  const handleVerifyPin = () => {
    if (!gatewayPin || gatewayPin.length < 4) {
      alert("PIN requires at least 4 digits.");
      return;
    }
    setGatewayState("processing");

    setTimeout(() => {
      // Complete Order Creation
      const mockTrx = (paymentMethod === "bKash" ? "BK" : "NG") + Math.random().toString(36).substr(2, 8).toUpperCase();
      const pointsSpent = useLoyaltyPoints ? Math.min(user.loyaltyPoints, Math.ceil(loyaltyDiscount / 0.005)) : 0;
      
      const ord = placeOrder(
        game,
        selectedPackage!,
        playerId,
        playerEmail,
        paymentMethod,
        gatewayPhone,
        mockTrx,
        finalPrice,
        coinsEarned,
        pointsSpent
      );

      setGatewayState("success");
      setTimeout(() => {
        onOrderSuccess(ord);
        onClose();
      }, 1500);

    }, 2000);
  };

  // Simulated Manual Deposit sequence
  const handleManualVerify = () => {
    setManualError("");
    if (!senderNumber || senderNumber.length < 10) {
      setManualError("Please input sender wallet account phone.");
      return;
    }
    if (!transId.trim() || transId.length < 6) {
      setManualError("A valid transaction TrxID received from your SMS is required.");
      return;
    }

    const pointsSpent = useLoyaltyPoints ? Math.min(user.loyaltyPoints, Math.ceil(loyaltyDiscount / 0.005)) : 0;
    const ord = placeOrder(
      game,
      selectedPackage!,
      playerId,
      playerEmail,
      paymentMethod,
      senderNumber,
      transId.trim().toUpperCase(),
      finalPrice,
      coinsEarned,
      pointsSpent
    );

    onOrderSuccess(ord);
    onClose();
  };

  return (
    <div id="checkout-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      
      {/* Outer frame */}
      <div className="relative w-full max-w-[580px] bg-slate-900 border border-slate-800/80 rounded-2xl glow-card overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Banner header of current matching game */}
        <div className="relative p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-between border-b border-slate-800 select-none shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <img src={game.image} alt={game.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Linzo Checkout Guard</span>
              <h2 className="font-display font-semibold text-lg text-white -mt-0.5">{game.name} Top Up</h2>
            </div>
          </div>
          <button 
            id="close-checkout-modal"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all pointer-events-auto cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">

          {checkoutStep === "details" && (
            <>
              {/* Step 1: Account info ID locator details */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1">
                  <label className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-indigo-400" />
                    Step 1: Enter {isGiftCard ? "Delivery Info" : "Game ID Properties"}
                  </label>
                  <span className="text-[10px] text-amber-500 font-medium flex items-center gap-0.5 cursor-help" title="To locate your ID code, load up the game on your gadget, trigger profile configs, and tab copy icon next to player identifier string!">
                    <HelpCircle size={10} />
                    Where to find?
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    id="input-player-id"
                    placeholder={game.uidPlaceholder}
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      if (formErrors.id) setFormErrors(prev => ({ ...prev, id: undefined }));
                    }}
                    className={`w-full bg-slate-950/40 border text-white rounded-xl py-3 px-4 text-sm font-medium transition-all focus:outline-none placeholder-slate-500 ${
                      formErrors.id ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500/50"
                    }`}
                  />
                  {formErrors.id && <p className="text-[10px] text-red-400 font-semibold">{formErrors.id}</p>}

                  {/* Optional Email delivery for giftcards */}
                  {game.requiresEmail && (
                    <div className="space-y-1">
                      <input
                        type="email"
                        id="input-player-email"
                        placeholder="Recharge Pin Recipient Email (e.g. gmail)"
                        value={playerEmail}
                        onChange={(e) => {
                          setPlayerEmail(e.target.value);
                          if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full bg-slate-950/40 border text-white rounded-xl py-3 px-4 text-sm font-medium transition-all focus:outline-none placeholder-slate-500 ${
                          formErrors.email ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500/50"
                        }`}
                      />
                      {formErrors.email && <p className="text-[10px] text-red-400 font-semibold">{formErrors.email}</p>}
                      <p className="text-[9px] text-slate-500">Digital activation voucher code is auto-mailed to this address on delivery.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Recharge packages selection cards */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-400 animate-pulse-slow font-medium" />
                  Step 2: Select Recharge Coin/Diamond Package
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                  {game.packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        id={`pkg-select-${pkg.id}`}
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setAppliedCoupon(null); // Clear coupons when price changes to re-evaluate
                          if (formErrors.pkg) setFormErrors(prev => ({ ...prev, pkg: undefined }));
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none ${
                          isSelected
                            ? "bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-[0.98]"
                            : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/20"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-display font-semibold text-xs sm:text-sm text-white line-clamp-1">{pkg.name}</span>
                          {isSelected && <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center text-white"><Check size={8} strokeWidth={3} /></div>}
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-sm font-black text-indigo-400 font-mono">{formatPrice(pkg.price)}</span>
                          {pkg.originalPrice > pkg.price && (
                            <span className="text-[10px] text-slate-505 text-slate-500 line-through font-mono">{formatPrice(pkg.originalPrice)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-medium">
                          <Coins size={9} className="text-amber-500" />
                          <span>+{pkg.pointsEarned} Coins</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formErrors.pkg && <p className="text-[10px] text-red-400 font-semibold mt-1">{formErrors.pkg}</p>}
              </div>

              {/* Step 3: Payment Method Gateways */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <CreditCard size={13} className="text-indigo-400" />
                  Step 3: Choose Secure Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "bKash", color: "hover:border-pink-500/20 active:bg-pink-500/5", activeColor: "border-pink-500 bg-pink-500/5 text-pink-400", label: "bKash" },
                    { id: "Nagad", color: "hover:border-orange-500/20 active:bg-orange-500/5", activeColor: "border-orange-500 bg-orange-500/5 text-orange-400", label: "Nagad" },
                    { id: "Rocket", color: "hover:border-purple-500/20 active:bg-purple-500/5", activeColor: "border-purple-500 bg-purple-500/5 text-purple-400", label: "Rocket" },
                    { id: "Card", color: "hover:border-indigo-500/20 active:bg-indigo-500/5", activeColor: "border-indigo-500 bg-indigo-500/5 text-indigo-400", label: "Cards" }
                  ].map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        id={`payment-method-${method.id}`}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`py-2 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 select-none pointer-events-auto cursor-pointer ${
                          isSelected ? method.activeColor : `bg-slate-900/40 border-slate-800 ${method.color} text-slate-400`
                        }`}
                      >
                        <span className="font-display tracking-tight text-xs">{method.label}</span>
                        <span className="text-[7px] font-sans font-normal opacity-70">
                          {method.id === "Card" ? "Visa/MC" : "SMS verified"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Loyalty & Voucher Discount Sub-drawer */}
              {selectedPackage && (
                <div className="bg-slate-800/40 rounded-xl border border-slate-750 border-slate-800 p-3 space-y-3">
                  
                  {/* Coupon layout */}
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Ticket size={14} className="absolute left-3 top-2.5 text-slate-550 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Voucher Promo Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-indigo-500/50 placeholder-slate-500 uppercase font-mono"
                      />
                    </div>
                    <button
                      id="apply-coupon-btn"
                      onClick={handleApplyCoupon}
                      className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs select-none transition-all pointer-events-auto cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[9px] text-red-400 font-semibold">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      Coupon "{appliedCoupon.code}" saved you {formatPrice(appliedCoupon.discount)}!
                    </p>
                  )}

                  {/* Loyalty Points Accumulation & Redemptions */}
                  {user.loyaltyPoints > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Coins size={14} className="text-amber-500" />
                        <div>
                          <p className="text-xs font-bold text-white">Loyalty Coupon Redemption</p>
                          <p className="text-[9px] text-slate-400">Apply {user.loyaltyPoints} Coins to save {formatPrice(user.loyaltyPoints * 0.005)}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useLoyaltyPoints}
                          onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-950/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-350 after:border-slate-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* SIMULATION GATEWAY: bkash_gateway Screen layout */}
          {checkoutStep === "bkash_gateway" && (
            <div className="bg-[#e2126d] p-5 rounded-2xl border border-pink-400/20 text-white flex flex-col justify-between min-h-[340px] select-none shadow-[0_0_20px_rgba(226,18,109,0.3)]">
              {/* bKash branded header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-display font-black text-lg tracking-wider">bKash <span className="font-sans font-light">Checkout</span></span>
                <span className="bg-black/25 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase border border-white/10 tracking-widest">
                  Secure SMS Guard
                </span>
              </div>

              {gatewayState === "phone" && (
                <div className="my-auto space-y-4">
                  <div className="text-center">
                    <Smartphone className="mx-auto text-white/90 mb-2 scale-110" />
                    <h3 className="font-bold text-sm">Enter Wallet Mobile Number</h3>
                    <p className="text-[10px] text-pink-100 mt-1">Specify your 11 digit bKash customer sender account address</p>
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 01712345678"
                    value={gatewayPhone}
                    onChange={(e) => setGatewayPhone(e.target.value)}
                    maxLength={11}
                    className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-3 px-4 text-center font-mono text-lg font-bold tracking-widest placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/20"
                  />
                  <p className="text-[9px] text-pink-200 text-center leading-normal">
                    By clicking continue, you agree to the terms and authorize the simulated charge of <span className="font-extrabold text-white">{formatPrice(finalPrice)}</span> to Linzo.
                  </p>
                  <button
                    id="bkash-phone-submit"
                    onClick={startGatewaySequence}
                    className="w-full py-3 rounded-xl bg-black text-[#e2126d] font-black text-sm uppercase tracking-wider hover:bg-white/15 hover:text-white transition-all duration-300"
                  >
                    Agree & Continue
                  </button>
                </div>
              )}

              {gatewayState === "otp" && (
                <div className="my-auto space-y-4">
                  <div className="text-center">
                    <Key className="mx-auto text-white/90 mb-2 animate-bounce-subtle" />
                    <h3 className="font-bold text-sm">Enter Verification OTP Code</h3>
                    <p className="text-[10px] text-pink-100 mt-1">A mock SMS was dispatched to wallet {gatewayPhone}</p>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter Code 1234"
                    value={gatewayOtp}
                    onChange={(e) => setGatewayOtp(e.target.value)}
                    maxLength={4}
                    className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-3 px-4 text-center font-mono text-lg font-bold tracking-widest placeholder-white/40 focus:outline-none focus:border-white/50"
                  />
                  <button
                    id="bkash-otp-verify"
                    onClick={handleVerifyOtp}
                    className="w-full py-3 rounded-xl bg-black text-[#e2126d] font-black text-sm uppercase tracking-wider hover:bg-white/20 hover:text-white transition-all"
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {gatewayState === "pin" && (
                <div className="my-auto space-y-4">
                  <div className="text-center">
                    <Lock className="mx-auto text-white/90 mb-2" />
                    <h3 className="font-bold text-sm">Input Secure Account PIN</h3>
                    <p className="text-[10px] text-pink-100 mt-1">Simulated isolated portal protection. Your data is never saved.</p>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter 4 digit PIN"
                    value={gatewayPin}
                    onChange={(e) => setGatewayPin(e.target.value)}
                    maxLength={5}
                    className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-3 px-4 text-center font-mono text-lg font-bold tracking-widest placeholder-white/40 focus:outline-none focus:border-white/50"
                  />
                  <button
                    id="bkash-pin-verify"
                    onClick={handleVerifyPin}
                    className="w-full py-3 rounded-xl bg-black text-[#e2126d] font-black text-sm uppercase tracking-wider hover:bg-white/20 hover:text-white transition-all"
                  >
                    Confirm Charge
                  </button>
                </div>
              )}

              {gatewayState === "processing" && (
                <div className="my-auto text-center space-y-3 py-10">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-extrabold text-sm tracking-wide">Processing Secure bKash Deposit...</p>
                  <p className="text-xs text-pink-100 font-mono">Syncing TrxID and registering user coins</p>
                </div>
              )}

              {gatewayState === "success" && (
                <div className="my-auto text-center space-y-3 py-10">
                  <CheckCircle2 className="mx-auto text-white fill-emerald-500 scale-125 animate-pulse-slow" size={48} />
                  <p className="font-display font-black text-lg">Transaction Verification Succeeded!</p>
                  <p className="text-[11px] text-pink-100">Receipt and voucher keys dispatched to {playerEmail || "account dashboard"}.</p>
                </div>
              )}

              {/* Bottom footer branded logo */}
              <div className="flex items-center justify-between text-[11px] text-white/60 pt-4 border-t border-white/10 font-mono">
                <span>Charge Sum: {formatPrice(finalPrice)}</span>
                <span>bKash Secure</span>
              </div>
            </div>
          )}

          {/* SIMULATION GATEWAY: nagad_gateway Screen layout */}
          {checkoutStep === "nagad_gateway" && (
            <div className="bg-[#f04f23] p-5 rounded-2xl border border-orange-400/20 text-white flex flex-col justify-between min-h-[340px] select-none shadow-[0_0_20px_rgba(240,79,35,0.3)]">
              {/* Nagad branded header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-display font-black text-lg tracking-wider">Nagad <span className="font-sans font-light">Gateway</span></span>
                <span className="bg-black/25 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase border border-white/10 tracking-widest">
                  Secure Deposit
                </span>
              </div>

              {gatewayState === "phone" && (
                <div className="my-auto space-y-4">
                  <div className="text-center">
                    <Smartphone className="mx-auto text-white/90 mb-2 scale-110" />
                    <h3 className="font-bold text-sm">Enter Nagad Phone Number</h3>
                    <p className="text-[10px] text-orange-100 mt-1">Specify your 11 digit Nagad customer sender account address</p>
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 01812345678"
                    value={gatewayPhone}
                    onChange={(e) => setGatewayPhone(e.target.value)}
                    maxLength={11}
                    className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-3 px-4 text-center font-mono text-lg font-bold tracking-widest placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/20"
                  />
                  <p className="text-[9px] text-orange-200 text-center leading-normal">
                    By clicking continue, you authorize charge of <span className="font-extrabold text-white">{formatPrice(finalPrice)}</span> on Nagad secure processor.
                  </p>
                  <button
                    id="nagad-phone-submit"
                    onClick={startGatewaySequence}
                    className="w-full py-3 rounded-xl bg-black text-[#f04f23] font-black text-sm uppercase tracking-wider hover:bg-white/15 hover:text-white transition-all duration-300"
                  >
                    Continue
                  </button>
                </div>
              )}

              {gatewayState === "otp" && (
                <div className="my-auto space-y-4">
                  <div className="text-center">
                    <Key className="mx-auto text-white/90 mb-2 animate-bounce-subtle" />
                    <h3 className="font-bold text-sm">Enter Verification OTP Code</h3>
                    <p className="text-[10px] text-orange-100 mt-1">A simulated OTP code sent to {gatewayPhone}</p>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter Code 1234"
                    value={gatewayOtp}
                    onChange={(e) => setGatewayOtp(e.target.value)}
                    maxLength={4}
                    className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-3 px-4 text-center font-mono text-lg font-bold tracking-widest placeholder-white/40 focus:outline-none focus:border-white/50"
                  />
                  <button
                    id="nagad-otp-verify"
                    onClick={handleVerifyOtp}
                    className="w-full py-3 rounded-xl bg-black text-[#f04f23] font-black text-sm uppercase tracking-wider hover:bg-white/20 hover:text-white transition-all"
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {gatewayState === "pin" && (
                <div className="my-auto space-y-4">
                  <div className="text-center">
                    <Lock className="mx-auto text-white/90 mb-2" />
                    <h3 className="font-bold text-sm">Input Secure Account PIN</h3>
                    <p className="text-[10px] text-orange-100 mt-1">Secure payment proxy system guard.</p>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter 4 digit PIN"
                    value={gatewayPin}
                    onChange={(e) => setGatewayPin(e.target.value)}
                    maxLength={5}
                    className="w-full bg-white/15 border border-white/20 text-white rounded-xl py-3 px-4 text-center font-mono text-lg font-bold tracking-widest placeholder-white/40 focus:outline-none focus:border-white/50"
                  />
                  <button
                    id="nagad-pin-verify"
                    onClick={handleVerifyPin}
                    className="w-full py-3 rounded-xl bg-black text-[#f04f23] font-black text-sm uppercase tracking-wider hover:bg-white/20 hover:text-white transition-all"
                  >
                    Agree & Confirm
                  </button>
                </div>
              )}

              {gatewayState === "processing" && (
                <div className="my-auto text-center space-y-3 py-10">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-extrabold text-sm tracking-wide">Contacting Nagad instant gateway...</p>
                </div>
              )}

              {gatewayState === "success" && (
                <div className="my-auto text-center space-y-3 py-10">
                  <CheckCircle2 className="mx-auto text-white fill-emerald-500 scale-125 animate-pulse-slow" size={48} />
                  <p className="font-display font-black text-lg">Nagad Deposit Succeeded!</p>
                </div>
              )}

              {/* Bottom footer */}
              <div className="flex items-center justify-between text-[11px] text-white/60 pt-4 border-t border-white/10 font-mono">
                <span>Charge Sum: {formatPrice(finalPrice)}</span>
                <span>Nagad Secure</span>
              </div>
            </div>
          )}

          {/* SIMULATION GATEWAY: Manual Verification & deposits */}
          {checkoutStep === "manual_verify" && (
            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-4 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold pb-2 border-b border-white/5 uppercase font-display">
                <AlertTriangle size={15} />
                Manual Wallet Payment Validation
              </div>

              <div className="space-y-2 text-gray-300 leading-relaxed font-sans">
                <p>To finalize, perform a simulated transfer using your banking application:</p>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-1.5 font-mono">
                  <p className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-sans">Payment Method:</span>
                    <span className="font-extrabold text-white uppercase">{paymentMethod}</span>
                  </p>
                  <p className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-sans">Send Wallet No:</span>
                    <span className="font-extrabold text-yellow-300 font-mono">+880 1892-749103 (Personal)</span>
                  </p>
                  <p className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-sans">Amount Limit:</span>
                    <span className="font-extrabold text-emerald-400 font-mono">{formatPrice(finalPrice)}</span>
                  </p>
                </div>
                <p className="text-[11px] text-gray-400">After completing the transaction in your app, provide your transaction reference below to verify delivery:</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Sender Account Wallet Number</label>
                  <input
                    type="tel"
                    id="manual-phone-input"
                    placeholder="e.g. 01712345678"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-brand/50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-gray-400">SMS Transaction TrxID</label>
                    <button
                      onClick={() => setTransId("TRX" + Math.random().toString(36).substr(2, 8).toUpperCase())}
                      className="text-[9px] text-amber-500 hover:text-amber-400 font-bold"
                    >
                      Regenerate Mock TrxID
                    </button>
                  </div>
                  <input
                    type="text"
                    id="manual-trx-input"
                    placeholder="e.g. BK8J9S20D4"
                    value={transId}
                    onChange={(e) => setTransId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-brand/50 font-mono uppercase"
                  />
                </div>

                {manualError && <p className="text-[10px] text-red-400 font-semibold">{manualError}</p>}
              </div>

              <button
                id="submit-manual-verify"
                onClick={handleManualVerify}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-black font-black text-xs uppercase tracking-wider transition-all duration-300"
              >
                Submit Deposit Receipt
              </button>
            </div>
          )}

        </div>

        {/* Modal checkout pricing summary footer (Not visible in full branded popups) */}
        {checkoutStep === "details" && (
          <div className="p-5 bg-slate-950/40 border-t border-slate-800 shrink-0">
            {selectedPackage && (
              <div className="space-y-2 mb-4 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Recharge Bundle Subtotal:</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Voucher Savings:</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Loyalty Coins Discount:</span>
                    <span>-{formatPrice(loyaltyDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Loyalty Coins Earned:</span>
                  <span className="text-white">+{coinsEarned} Coins</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                  <span className="font-sans font-black text-slate-200">Amount to Checkout:</span>
                  <span className="text-xl font-black text-indigo-400 font-mono">{formatPrice(finalPrice)}</span>
                </div>
              </div>
            )}

            <button
              id="submit-checkout-btn"
              disabled={!selectedPackage}
              onClick={handleCheckoutSubmit}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 pointer-events-auto cursor-pointer ${
                selectedPackage 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold hover:scale-[1.01] active:translate-y-px" 
                  : "bg-slate-800/80 border border-slate-750/80 text-slate-500 cursor-not-allowed"
              }`}
            >
              Secure Top Up Process
              <ArrowRight size={14} />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-2.5">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Checkout matches baasiltopup secure transaction safety laws.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
