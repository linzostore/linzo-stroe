import { Game, Review, Coupon } from "../types";

export const GAMES_DATA: Game[] = [
  {
    id: "freefire",
    name: "Free Fire",
    category: "game",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300", // Will generate placeholder or select high quality graphics
    slogan: "Quick Diamond top-ups with instant Player ID delivery",
    uidPlaceholder: "Player UID (e.g. 248910482)",
    requiresEmail: false,
    popular: true,
    packages: [
      { id: "ff_1", name: "115 Diamonds", originalPrice: 1.20, price: 0.99, value: 115, unit: "Diamonds", pointsEarned: 10 },
      { id: "ff_2", name: "240 Diamonds", originalPrice: 2.50, price: 1.99, value: 240, unit: "Diamonds", pointsEarned: 20 },
      { id: "ff_3", name: "505 Diamonds", originalPrice: 5.00, price: 3.99, value: 505, unit: "Diamonds", pointsEarned: 40 },
      { id: "ff_4", name: "1080 Diamonds", originalPrice: 10.00, price: 7.99, value: 1080, unit: "Diamonds", pointsEarned: 80 },
      { id: "ff_5", name: "2200 Diamonds", originalPrice: 20.00, price: 15.99, value: 2200, unit: "Diamonds", pointsEarned: 160 },
      { id: "ff_weekly", name: "Weekly Lite Membership", originalPrice: 3.00, price: 2.20, value: 1, unit: "Weekly Pass", pointsEarned: 25 },
      { id: "ff_monthly", name: "Monthly Super Membership", originalPrice: 12.00, price: 9.50, value: 1, unit: "Monthly Pass", pointsEarned: 100 }
    ]
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    category: "game",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=301",
    slogan: "Unknown Cash top-ups directly to your Character ID",
    uidPlaceholder: "Character ID (e.g. 5134918239)",
    requiresEmail: false,
    popular: true,
    packages: [
      { id: "pubg_1", name: "60 UC", originalPrice: 1.25, price: 0.99, value: 60, unit: "UC", pointsEarned: 10 },
      { id: "pubg_2", name: "325 UC", originalPrice: 5.50, price: 4.80, value: 325, unit: "UC", pointsEarned: 50 },
      { id: "pubg_3", name: "660 UC", originalPrice: 11.00, price: 9.50, value: 660, unit: "UC", pointsEarned: 100 },
      { id: "pubg_4", name: "1800 UC", originalPrice: 28.00, price: 23.99, value: 1800, unit: "UC", pointsEarned: 250 },
      { id: "pubg_5", name: "3850 UC", originalPrice: 55.00, price: 47.99, value: 3850, unit: "UC", pointsEarned: 500 },
      { id: "pubg_rp", name: "Royale Pass Pack", originalPrice: 10.00, price: 8.50, value: 1, unit: "Royale Pass", pointsEarned: 90 }
    ]
  },
  {
    id: "mlbb",
    name: "Mobile Legends",
    category: "game",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=302",
    slogan: "Quick top-up for MLBB diamonds. Safe and secure authorization",
    uidPlaceholder: "User ID & Zone ID (e.g. 12345678 (1234))",
    requiresEmail: false,
    popular: true,
    packages: [
      { id: "ml_1", name: "86 Diamonds", originalPrice: 1.80, price: 1.50, value: 86, unit: "Diamonds", pointsEarned: 15 },
      { id: "ml_2", name: "172 Diamonds", originalPrice: 3.50, price: 2.99, value: 172, unit: "Diamonds", pointsEarned: 30 },
      { id: "ml_3", name: "514 Diamonds", originalPrice: 10.00, price: 8.90, value: 514, unit: "Diamonds", pointsEarned: 90 },
      { id: "ml_4", name: "1050 Diamonds", originalPrice: 20.00, price: 17.50, value: 1050, unit: "Diamonds", pointsEarned: 180 },
      { id: "mlbb_twilight", name: "Twilight Pass", originalPrice: 11.00, price: 9.99, value: 1, unit: "Twilight Pass", pointsEarned: 100 }
    ]
  },
  {
    id: "coc",
    name: "Clash of Clans",
    category: "game",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=303",
    slogan: "Gems and Gold Pass codes sent straight to Supercell ID",
    uidPlaceholder: "Player Tag Code (e.g. #Y7U98RY2)",
    requiresEmail: true,
    popular: false,
    packages: [
      { id: "coc_1", name: "500 Gems", originalPrice: 5.50, price: 4.99, value: 500, unit: "Gems", pointsEarned: 50 },
      { id: "coc_2", name: "1200 Gems", originalPrice: 11.00, price: 9.90, value: 1200, unit: "Gems", pointsEarned: 100 },
      { id: "coc_3", name: "2500 Gems", originalPrice: 22.00, price: 19.50, value: 2500, unit: "Gems", pointsEarned: 200 },
      { id: "coc_gold", name: "Clash Gold Pass", originalPrice: 7.99, price: 6.99, value: 1, unit: "Gold Pass", pointsEarned: 70 }
    ]
  },
  {
    id: "valorant",
    name: "Valorant Points",
    category: "game",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=304",
    slogan: "Valorant Points (Riot Pin) with hyper-speed email key delivery",
    uidPlaceholder: "Riot ID (e.g. TenZ#NA1)",
    requiresEmail: true,
    popular: true,
    packages: [
      { id: "val_1", name: "475 Points", originalPrice: 5.50, price: 4.99, value: 475, unit: "Points", pointsEarned: 50 },
      { id: "val_2", name: "1000 Points", originalPrice: 11.00, price: 9.99, value: 1000, unit: "Points", pointsEarned: 100 },
      { id: "val_3", name: "2050 Points", originalPrice: 22.00, price: 19.99, value: 2050, unit: "Points", pointsEarned: 200 },
      { id: "val_4", name: "5350 Points", originalPrice: 53.00, price: 46.99, value: 5350, unit: "Points", pointsEarned: 500 }
    ]
  },
  {
    id: "googleplay",
    name: "Google Play Gift Card",
    category: "giftcard",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=300",
    slogan: "US region Google Play Store Gift Card pins",
    uidPlaceholder: "Recipient Mobile Number",
    requiresEmail: true,
    popular: true,
    packages: [
      { id: "gp_us5", name: "$5 Google Play Card (US)", originalPrice: 5.50, price: 5.20, value: 5, unit: "USD", pointsEarned: 30 },
      { id: "gp_us10", name: "$10 Google Play Card (US)", originalPrice: 11.00, price: 10.25, value: 10, unit: "USD", pointsEarned: 60 },
      { id: "gp_us25", name: "$25 Google Play Card (US)", originalPrice: 27.00, price: 25.50, value: 25, unit: "USD", pointsEarned: 150 },
      { id: "gp_us50", name: "$50 Google Play Card (US)", originalPrice: 53.00, price: 49.99, value: 50, unit: "USD", pointsEarned: 300 }
    ]
  },
  {
    id: "appstore",
    name: "Apple Gift Card",
    category: "giftcard",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=301",
    slogan: "Apple & iTunes digital gift codes for easy app store purchases",
    uidPlaceholder: "Delivery Phone / Mobile Number",
    requiresEmail: true,
    popular: true,
    packages: [
      { id: "ap_us10", name: "$10 Apple Gift Card (US)", originalPrice: 11.50, price: 10.50, value: 10, unit: "USD", pointsEarned: 60 },
      { id: "ap_us25", name: "$25 Apple Gift Card (US)", originalPrice: 28.00, price: 25.99, value: 25, unit: "USD", pointsEarned: 160 },
      { id: "ap_us50", name: "$50 Apple Gift Card (US)", originalPrice: 54.00, price: 49.99, value: 50, unit: "USD", pointsEarned: 320 }
    ]
  },
  {
    id: "steam",
    name: "Steam Wallet Code",
    category: "giftcard",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=302",
    slogan: "Fuel your Steam library instantly with active CD keys",
    uidPlaceholder: "Contact Phone Number Only",
    requiresEmail: true,
    popular: false,
    packages: [
      { id: "steam_us5", name: "$5 Steam Wallet (US)", originalPrice: 5.80, price: 5.30, value: 5, unit: "USD", pointsEarned: 30 },
      { id: "steam_us10", name: "$10 Steam Wallet (US)", originalPrice: 11.50, price: 10.60, value: 10, unit: "USD", pointsEarned: 60 },
      { id: "steam_us20", name: "$20 Steam Wallet (US)", originalPrice: 22.50, price: 20.90, value: 20, unit: "USD", pointsEarned: 120 }
    ]
  },
  {
    id: "playstation",
    name: "PlayStation Network Card",
    category: "giftcard",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=303",
    slogan: "PlayStation Store digital coupon codes with speedy checkout",
    uidPlaceholder: "Contact Mobile Number",
    requiresEmail: true,
    popular: false,
    packages: [
      { id: "psn_us10", name: "$10 PSN Card (US)", originalPrice: 11.20, price: 10.45, value: 10, unit: "USD", pointsEarned: 60 },
      { id: "psn_us25", name: "$25 PSN Card (US)", originalPrice: 27.50, price: 25.80, value: 25, unit: "USD", pointsEarned: 150 },
      { id: "psn_us50", name: "$50 PSN Card (US)", originalPrice: 53.50, price: 49.95, value: 50, unit: "USD", pointsEarned: 310 }
    ]
  }
];

export const LATEST_REVIEWS: Review[] = [
  {
    id: "r1",
    username: "Nabil_Gamer",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40",
    rating: 5,
    gameName: "Free Fire",
    comment: "Easiest Diamond topup ever. Took exactly 2 minutes via bKash! The points program gave me secondary discounts. High fidelity app UI too!",
    date: "1 hour ago",
    verified: true
  },
  {
    id: "r2",
    username: "AnikPro_99",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&h=40",
    rating: 5,
    gameName: "PUBG Mobile",
    comment: "Excellent rate for 325 UC! Flash notifications help score active coupons immediately. Recommend to everyone.",
    date: "4 hours ago",
    verified: true
  },
  {
    id: "r3",
    username: "Tamanna_MLBB",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=40&h=40",
    rating: 5,
    gameName: "Mobile Legends",
    comment: "Twilight pass delivered super fast. Customer details are saved so re-ordering takes only 2 clicks. Top score!",
    date: "1 day ago",
    verified: true
  }
];

export const COUPONS_DATA: Coupon[] = [
  { code: "LINZOMOBILE", discount: 0.50, minSpend: 1.00, description: "$0.50 flat discount for first top-up" },
  { code: "BOOM777", discount: 1.50, minSpend: 10.00, description: "$1.50 off on orders above $10.00" },
  { code: "FFDIAMOND", discount: 2.50, minSpend: 15.00, description: "Save $2.50 on large gamer packages" },
  { code: "VIPREWARDS", discount: 5.00, minSpend: 30.00, description: "Exclusive loyalty tier coupon" }
];
