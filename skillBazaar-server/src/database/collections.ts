import { Collection } from "mongodb";
import { getDB } from "../config/db";
import type {
  HostProfile,
  Experience,
  Session,
  Booking,
  Review,
  StripeEvent,
  Report,
  ContactMessage,
  Category,
} from "../types";

export function hostProfilesCollection(): Collection<HostProfile> {
  return getDB().collection<HostProfile>("host_profiles");
}

export function experiencesCollection(): Collection<Experience> {
  return getDB().collection<Experience>("experiences");
}

export function sessionsCollection(): Collection<Session> {
  return getDB().collection<Session>("sessions");
}

export function bookingsCollection(): Collection<Booking> {
  return getDB().collection<Booking>("bookings");
}

export function reviewsCollection(): Collection<Review> {
  return getDB().collection<Review>("reviews");
}

export function stripeEventsCollection(): Collection<StripeEvent> {
  return getDB().collection<StripeEvent>("stripeEvents");
}

export function reportsCollection(): Collection<Report> {
  return getDB().collection<Report>("reports");
}

export function contactMessagesCollection(): Collection<ContactMessage> {
  return getDB().collection<ContactMessage>("contactMessages");
}

export function categoriesCollection(): Collection<Category> {
  return getDB().collection<Category>("categories");
}
