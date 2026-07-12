export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}

export interface Location {
  country: string;
  city: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Experience {
  _id: string;
  hostId: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string | Category;
  tags: string[];
  durationMinutes: number;
  pricePerParticipant: number;
  currency: string;
  defaultCapacity: number;
  minimumAge: number;
  includedItems: string[];
  participantRequirements: string[];
  safetyNotes: string[];
  location: Location;
  images: string[];
  status: "draft" | "published" | "rejected" | "archived";
  averageRating: number;
  reviewCount: number;
  ratingSummary?: { average: number; count: number };
  hostName?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  _id: string;
  experienceId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  remainingSpots: number;
  status: "scheduled" | "cancelled" | "completed";
}

export interface Booking {
  _id: string;
  reference: string;
  experienceId: string;
  sessionId: string;
  userId: string;
  participantCount: number;
  totalAmount: number;
  platformFee: number;
  currency?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  session?: Session;
  experience?: Experience;
  hostProfile?: HostProfile;
  createdAt: string;
  updatedAt: string;
}

export interface HostProfile {
  _id: string;
  userId: string;
  displayName: string;
  bio: string;
  skills: string[];
  languages: string[];
  city: string;
  phone: string;
  stripeConnectId?: string;
  stripeOnboardingComplete: boolean;
  verificationStatus: "unverified" | "verified" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  experienceId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Report {
  _id: string;
  type: "experience" | "host" | "user";
  targetId: string;
  reporterId: string;
  reason: string;
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
}
