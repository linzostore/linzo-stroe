import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, Order, InAppNotification, Game, Package, LoyaltyTier } from "../types";
import { GAMES_DATA } from "../data/gameData";

interface AppContextType {
  user: UserProfile;
  orders: Order[];
  notifications: InAppNotification[];
  activeModalGame: Game | null;
  setActiveModalGame: (game: Game | null) => void;
  placeOrder: (game: Game, pkg: Package, playerId: string, playerEmail: string, paymentMethod: string, paymentNumber: string, transactionId: string, finalPrice: number, pointsEarned: number, pointsRedeemed: number) => Order;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  claimLoyaltyReward: (points: number, rewardDescription: string) => boolean;
  addNotification: (title: string, message: string, type: InAppNotification["type"]) => void;
  clearNotifications: () => void;
  markAllNotificationsRead: () => void;
  activeToast: { id: string; title: string; message: string; type: InAppNotification["type"] } | null;
  dismissToast: () => void;
  resetUserProgress: () => void;
  claimDailyBonus: (amount: number) => void;
  currency: "USD" | "BDT";
  toggleCurrency: () => void;
  formatPrice: (usdAmount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  name: "Mihimitha Gamer",
  email: "mihimithakodithuwakku360@gmail.com",
  loyaltyPoints: 340,
  totalSpent: 48.90,
  tier: "Silver",
  phoneNumber: "+880 1712-984210"
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-9281",
    gameId: "freefire",
    gameName: "Free Fire",
    gameImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150",
    packageName: "240 Diamonds",
    price: 1.99,
    playerId: "248910482",
    paymentMethod: "bKash",
    paymentNumber: "01788294711",
    transactionId: "BK9J2K8D3S",
    status: "completed",
    date: new Date(Date.now() - 48 * 3600 * 1000).toLocaleString(),
    pointsEarned: 20
  },
  {
    id: "ORD-7391",
    gameId: "pubg",
    gameName: "PUBG Mobile",
    gameImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=151",
    packageName: "325 UC",
    price: 4.80,
    playerId: "5134918239",
    paymentMethod: "Nagad",
    paymentNumber: "01928341999",
    transactionId: "NG4X7W1P8O",
    status: "processing",
    date: new Date(Date.now() - 24 * 3600 * 1000).toLocaleString(),
    pointsEarned: 50
  }
];

const DEFAULT_NOTIFICATIONS: InAppNotification[] = [
  {
    id: "n-1",
    title: "⚡ Flash Sale Live!",
    message: "Get up to 20% discount on Free Fire diamond packages matching baasiltopup rates. Today only!",
    type: "sale",
    date: "A few mins ago",
    read: false
  },
  {
    id: "n-2",
    title: "🎖️ Silver Tier Unlocked",
    message: "Welcome to Silver rank! You now earn 1.2x extra loyalty points on every game top-up checkout.",
    type: "loyalty",
    date: "1 day ago",
    read: true
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const cached = localStorage.getItem("linzo_user");
    return cached ? JSON.parse(cached) : DEFAULT_USER;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = localStorage.getItem("linzo_orders");
    return cached ? JSON.parse(cached) : DEFAULT_ORDERS;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const cached = localStorage.getItem("linzo_notifications");
    return cached ? JSON.parse(cached) : DEFAULT_NOTIFICATIONS;
  });

  const [activeModalGame, setActiveModalGame] = useState<Game | null>(null);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; type: InAppNotification["type"] } | null>(null);
  const [currency, setCurrency] = useState<"USD" | "BDT">(() => {
    return (localStorage.getItem("linzo_currency") as "USD" | "BDT") || "USD";
  });

  useEffect(() => {
    localStorage.setItem("linzo_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("linzo_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("linzo_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("linzo_currency", currency);
  }, [currency]);

  // Unified automatic point update & Tier calculator
  const calculateTier = (totalSpent: number): LoyaltyTier => {
    if (totalSpent >= 200) return "Platinum";
    if (totalSpent >= 100) return "Gold";
    if (totalSpent >= 25) return "Silver";
    return "Bronze";
  };

  const addNotification = (title: string, message: string, type: InAppNotification["type"]) => {
    const newNotif: InAppNotification = {
      id: "n-" + Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      date: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast({ id: newNotif.id, title, message, type });
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const placeOrder = (
    game: Game,
    pkg: Package,
    playerId: string,
    playerEmail: string,
    paymentMethod: string,
    paymentNumber: string,
    transactionId: string,
    finalPrice: number,
    pointsEarned: number,
    pointsRedeemed: number
  ): Order => {
    const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: orderId,
      gameId: game.id,
      gameName: game.name,
      gameImage: game.image,
      packageName: pkg.name,
      price: finalPrice,
      playerId,
      playerEmail: playerEmail || undefined,
      paymentMethod,
      paymentNumber,
      transactionId,
      status: "pending", // Starts as pending matching manual verify step
      date: new Date().toLocaleString(),
      pointsEarned,
      pointsRedeemed: pointsRedeemed > 0 ? pointsRedeemed : undefined
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update user stats
    setUser(prev => {
      const netPointsDiff = pointsEarned - pointsRedeemed;
      const newTotalSpent = prev.totalSpent + finalPrice;
      const newTier = calculateTier(newTotalSpent);
      return {
        ...prev,
        totalSpent: newTotalSpent,
        loyaltyPoints: Math.max(0, prev.loyaltyPoints + netPointsDiff),
        tier: newTier
      };
    });

    addNotification(
      "🛒 Order Submitted Successful",
      `Your recharge order ${orderId} is currently under validation review. Usually completed within 2-5 minutes.`,
      "order"
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(prev => {
      const index = prev.findIndex(o => o.id === orderId);
      if (index === -1) return prev;
      const updated = [...prev];
      const oldOrder = updated[index];
      
      // If completed but wasn't before, trigger correct points alert
      if (status === "completed" && oldOrder.status !== "completed") {
        setTimeout(() => {
          addNotification(
            "✅ Recharge Delivered!",
            `Order ${orderId} (${oldOrder.packageName}) is now completed. Your coins/diamonds have been loaded!`,
            "order"
          );
          addNotification(
            "💎 Loyalty Points Credited",
            `Earned +${oldOrder.pointsEarned} coins. Current tier: ${user.tier}. Check loyalty dashboard!`,
            "loyalty"
          );
        }, 500);
      } else if (status === "processing" && oldOrder.status !== "processing") {
        setTimeout(() => {
          addNotification(
            "⏳ Order in Process",
            `Security review completed. Order ${orderId} is now being loaded into player ID ${oldOrder.playerId}.`,
            "order"
          );
        }, 500);
      } else if (status === "cancelled" && oldOrder.status !== "cancelled") {
        setTimeout(() => {
          addNotification(
            "❌ Order Cancelled",
            `Refund initiated for order ${orderId}. Please contact LINZO 24/7 Live chat if you think this is a typo error.`,
            "system"
          );
        }, 500);
      }

      updated[index] = { ...oldOrder, status };
      return updated;
    });
  };

  const claimLoyaltyReward = (pointsToRedeem: number, rewardDescription: string): boolean => {
    if (user.loyaltyPoints < pointsToRedeem) {
      addNotification("❌ Reward Claim Failed", "Insufficient loyalty points balance.", "system");
      return false;
    }
    setUser(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints - pointsToRedeem
    }));
    addNotification(
      "🎁 Reward Claimed!",
      `Successfully redeemed "${rewardDescription}" using ${pointsToRedeem} Linzo Coins. Coupon applied to checkout automatically.`,
      "loyalty"
    );
    return true;
  };

  const claimDailyBonus = (amount: number) => {
    setUser(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + amount,
      lastDailyClaim: new Date().toISOString()
    }));
    addNotification(
      "🎁 Daily Bonus Claimed!",
      `Successfully claimed your daily bonus of +${amount} Linzo Coins. Come back tomorrow!`,
      "loyalty"
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleCurrency = () => {
    setCurrency(prev => (prev === "USD" ? "BDT" : "USD"));
  };

  const formatPrice = (usdAmount: number) => {
    if (currency === "BDT") {
      return `৳${Math.round(usdAmount * 120)}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  const resetUserProgress = () => {
    setUser(DEFAULT_USER);
    setOrders(DEFAULT_ORDERS);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setActiveToast(null);
    setActiveModalGame(null);
    setCurrency("USD");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        orders,
        notifications,
        activeModalGame,
        setActiveModalGame,
        placeOrder,
        updateOrderStatus,
        claimLoyaltyReward,
        addNotification,
        clearNotifications,
        markAllNotificationsRead,
        activeToast,
        dismissToast,
        resetUserProgress,
        claimDailyBonus,
        currency,
        toggleCurrency,
        formatPrice
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
};
