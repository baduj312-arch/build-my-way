export type Provider = {
  id: string;
  name: string;
  type: "Mechanic" | "Vulcanizer" | "Tow Truck" | "Fuel" | "Battery";
  rating: number;
  reviews: number;
  distanceKm: number;
  etaMin: number;
  verified: boolean;
  trustScore: number;
  workshop: string;
  avatar: string;
  successRate: number;
};

export const providers: Provider[] = [
  {
    id: "p1",
    name: "Kwame Mensah",
    type: "Mechanic",
    rating: 4.9,
    reviews: 287,
    distanceKm: 1.2,
    etaMin: 6,
    verified: true,
    trustScore: 96,
    workshop: "Mensah Auto Care",
    avatar: "KM",
    successRate: 98,
  },
  {
    id: "p2",
    name: "Akua Boateng",
    type: "Vulcanizer",
    rating: 4.8,
    reviews: 412,
    distanceKm: 0.8,
    etaMin: 4,
    verified: true,
    trustScore: 94,
    workshop: "Boateng Tyre House",
    avatar: "AB",
    successRate: 97,
  },
  {
    id: "p3",
    name: "Yaw Owusu",
    type: "Tow Truck",
    rating: 4.7,
    reviews: 156,
    distanceKm: 2.4,
    etaMin: 11,
    verified: true,
    trustScore: 89,
    workshop: "Owusu Recovery Services",
    avatar: "YO",
    successRate: 94,
  },
  {
    id: "p4",
    name: "Ama Asante",
    type: "Battery",
    rating: 4.9,
    reviews: 198,
    distanceKm: 1.6,
    etaMin: 7,
    verified: true,
    trustScore: 95,
    workshop: "PowerStart 24/7",
    avatar: "AA",
    successRate: 99,
  },
  {
    id: "p5",
    name: "Kojo Nyarko",
    type: "Fuel",
    rating: 4.6,
    reviews: 89,
    distanceKm: 3.1,
    etaMin: 14,
    verified: true,
    trustScore: 87,
    workshop: "QuickFuel Delivery",
    avatar: "KN",
    successRate: 92,
  },
];

export type ServiceCategory = {
  id: string;
  label: string;
  icon: string;
  basePrice: number;
  desc: string;
};

export const services: ServiceCategory[] = [
  { id: "mech", label: "Mechanic", icon: "Wrench", basePrice: 80, desc: "Engine, electrical, repairs" },
  { id: "tyre", label: "Vulcanizer", icon: "Disc3", basePrice: 45, desc: "Puncture, replacement" },
  { id: "tow", label: "Tow Truck", icon: "Truck", basePrice: 120, desc: "Light, medium, heavy" },
  { id: "fuel", label: "Fuel", icon: "Fuel", basePrice: 35, desc: "Emergency delivery" },
  { id: "batt", label: "Jumpstart", icon: "BatteryCharging", basePrice: 40, desc: "24/7 battery boost" },
  { id: "key", label: "Lockout", icon: "Key", basePrice: 60, desc: "Locked keys, broken locks" },
];

export type Job = {
  id: string;
  date: string;
  service: string;
  provider: string;
  status: "Completed" | "Cancelled" | "Refunded";
  amount: number;
  rating?: number;
};

export const jobHistory: Job[] = [
  { id: "TRN-3402", date: "May 18, 2026", service: "Vulcanizer", provider: "Boateng Tyre House", status: "Completed", amount: 55, rating: 5 },
  { id: "TRN-3387", date: "May 11, 2026", service: "Jumpstart", provider: "PowerStart 24/7", status: "Completed", amount: 40, rating: 5 },
  { id: "TRN-3301", date: "Apr 28, 2026", service: "Tow Truck", provider: "Owusu Recovery", status: "Completed", amount: 180, rating: 4 },
  { id: "TRN-3245", date: "Apr 14, 2026", service: "Mechanic", provider: "Mensah Auto Care", status: "Completed", amount: 95, rating: 5 },
  { id: "TRN-3198", date: "Apr 02, 2026", service: "Fuel", provider: "QuickFuel", status: "Cancelled", amount: 0 },
];

export const driver = {
  name: "Nana Adjei",
  phone: "+233 24 *** 4421",
  email: "n.adjei@tireno.app",
  initials: "NA",
  vehicle: {
    make: "Toyota",
    model: "Corolla 2019",
    plate: "GR-4421-21",
    tyreSize: "205/55 R16",
    color: "Silver",
  },
  emergencyContacts: [
    { name: "Akosua Adjei", relation: "Spouse", phone: "+233 24 *** 1102" },
    { name: "Kofi Adjei", relation: "Brother", phone: "+233 20 *** 8843" },
    { name: "Mama Adjei", relation: "Mother", phone: "+233 27 *** 0098" },
  ],
  savedLocations: [
    { label: "Home", address: "East Legon, Accra" },
    { label: "Work", address: "Airport City, Accra" },
    { label: "Gym", address: "Cantonments, Accra" },
  ],
  walletBalance: 240,
  safetyScore: 98,
};
