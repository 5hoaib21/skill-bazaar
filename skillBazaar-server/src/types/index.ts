import { ObjectId } from "mongodb";

export interface HostProfile {
  _id?: ObjectId;
  userId: string;
  displayName: string | null;
  bio: string | null;
  skills: string[];
  languages: string[];
  city: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  verificationStatus: string;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceImage {
  url: string;
  alt: string;
  isCover: boolean;
}

export interface ExperienceLocation {
  country: string;
  city: string;
  area: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  publicLocationLabel: string;
}

export interface ExperienceModeration {
  reviewedBy: ObjectId | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
}

export interface RatingSummary {
  average: number;
  count: number;
}

export type ExperienceStatus = string;

export interface Experience {
  _id?: ObjectId;
  hostId: ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  tags: string[];
  language: string;
  durationMinutes: number;
  pricePerParticipant: number;
  currency: string;
  defaultCapacity: number;
  minimumAge: number | null;
  includedItems: string[];
  participantRequirements: string[];
  safetyNotes: string[];
  cancellationPolicyId: string;
  images: ExperienceImage[];
  location: ExperienceLocation;
  status: string;
  moderation: ExperienceModeration;
  ratingSummary: RatingSummary;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionStatus = string;

export interface Session {
  _id?: ObjectId;
  experienceId: ObjectId;
  hostId: ObjectId;
  startAt: Date;
  endAt: Date;
  capacity: number;
  reservedSeats: number;
  confirmedSeats: number;
  bookingCutoffAt: Date;
  status: string;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = string;
export type PaymentStatus = string;
export type CancelledBy = string;

export interface BookingCancellation {
  cancelledBy: string | null;
  reason: string | null;
  cancelledAt: Date | null;
}

export interface BookingStripe {
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  chargeId: string | null;
  refundIds: string[];
  connectedAccountId: string | null;
}

export interface Booking {
  _id?: ObjectId;
  bookingReference: string;
  userId: ObjectId;
  hostId: ObjectId;
  experienceId: ObjectId;
  sessionId: ObjectId;
  participantCount: number;
  currency: string;
  subtotalAmount: number;
  platformFeeAmount: number;
  taxAmount: number;
  totalAmount: number;
  hostEarningAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  seatHoldExpiresAt: Date | null;
  stripe: BookingStripe;
  cancellation: BookingCancellation;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewStatus = string;

export interface Review {
  _id?: ObjectId;
  bookingId: ObjectId;
  experienceId: ObjectId;
  hostId: ObjectId;
  reviewerId: ObjectId;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StripeEvent {
  _id?: ObjectId;
  stripeEventId: string;
  eventType: string;
  processed: boolean;
  processedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export type ReportTargetType = string;
export type ReportStatus = string;

export interface Report {
  _id?: ObjectId;
  reporterId: ObjectId;
  targetType: string;
  targetId: ObjectId;
  reason: string;
  details: string;
  status: string;
  reviewedBy: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  _id?: ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

export interface Category {
  _id?: ObjectId;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
