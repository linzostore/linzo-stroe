export type GameCategory = "game" | "giftcard";

export interface Game {
  id: string;
  name: string;
  category: GameCategory;
  image: string;
  slogan: string;
  uidPlaceholder: string;
  requiresEmail: boolean;
  popular: boolean;
  packages: Package[];
}

export interface Package {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  value: number;
  unit: string;
  pointsEarned: number;
}

export type OrderStatus = "pending" | "paid" | "processing" | "completed" | "cancelled";

export interface Order {
  id: string;
  gameId: string;
  gameName: string;
  gameImage: string;
  packageName: string;
  price: number;
  playerId: string;
  playerEmail?: string;
  paymentMethod: string;
  paymentNumber: string;
  transactionId: string;
  status: OrderStatus;
  date: string;
  pointsEarned: number;
  pointsRedeemed?: number;
}

export type LoyaltyTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface UserProfile {
  name: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: number;
  tier: LoyaltyTier;
  phoneNumber: string;
  lastDailyClaim?: string;
}

export interface Coupon {
  code: string;
  discount: number;
  minSpend: number;
  description: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "sale" | "order" | "loyalty" | "system";
  date: string;
  read: boolean;
  link?: string;
}

export interface Review {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  gameName: string;
  comment: string;
  date: string;
  verified: boolean;
}
