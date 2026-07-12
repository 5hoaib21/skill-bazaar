"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Experience, Session, Review } from "@/types";

export default function ExperienceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [participantCount, setParticipantCount] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const [exp, sess, revs] = await Promise.all([
          api.get<Experience>(`/api/experiences/${params.id}`),
          api.get<Session[]>(`/api/experiences/${params.id}/sessions`),
          api.get<Review[]>(`/api/experiences/${params.id}/reviews`),
        ]);
        setExperience(exp);
        setSessions(sess);
        setReviews(revs);
      } catch (err: any) {
        setError(err.message || "Failed to load experience");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleContinueToPayment = async () => {
    if (!session) {
      window.location.href = "/api/auth/signin";
      return;
    }
    if (!selectedSession) return;
    setBookingLoading(true);
    try {
      const result: any = await api.post("/api/bookings", {
        sessionId: selectedSession,
        participantCount,
      });
      if (result.checkoutUrl) {
        router.push(result.checkoutUrl);
      } else {
        router.push("/checkout/success");
      }
    } catch (err: any) {
      setError(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  if (error && !experience) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-off-white gap-4">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-deep-teal hover:underline">
          Back to explore
        </Link>
      </div>
    );
  }

  if (!experience) return null;

  const images =
    experience.images.length > 0
      ? experience.images
      : ["https://placehold.co/800x500?text=No+Image"];

  const platformFeeRate = 0.1;
  const subtotal = experience.pricePerParticipant * participantCount;
  const platformFee = Math.round(subtotal * platformFeeRate * 100) / 100;
  const total = subtotal + platformFee;

  const categoryName =
    typeof experience.category === "object"
      ? (experience.category as any).name
      : experience.category;

  const availableSessions = sessions.filter(
    (s) => s.status === "scheduled" && s.remainingSpots > 0
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? "text-warm-amber" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-200">
                <img
                  src={images[selectedImage]}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === selectedImage
                          ? "border-deep-teal"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-deep-teal/10 text-deep-teal text-sm font-medium rounded-full">
                  {categoryName}
                </span>
                <div className="flex items-center gap-1">
                  {renderStars(experience.averageRating)}
                  <span className="text-sm text-charcoal ml-1">
                    ({experience.reviewCount})
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-charcoal">
                {experience.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-charcoal">
                {experience.hostName && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {experience.hostName}
                  </span>
                )}
                {experience.location.city && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {experience.location.city}
                    {experience.location.area && `, ${experience.location.area}`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {experience.durationMinutes} min
                </span>
                {experience.defaultCapacity && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Up to {experience.defaultCapacity}
                  </span>
                )}
                {experience.language && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 1.998V11a2 2 0 102 0v-.5a1.5 1.5 0 011.5-1.5h1.5" />
                    </svg>
                    {experience.language}
                  </span>
                )}
              </div>

              <p className="text-lg text-charcoal/80">
                {experience.shortDescription}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-3">
                  About this experience
                </h2>
                <p className="text-charcoal/70 leading-relaxed whitespace-pre-line">
                  {experience.fullDescription}
                </p>
              </div>

              {experience.includedItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    What&apos;s included
                  </h3>
                  <ul className="space-y-1">
                    {experience.includedItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-charcoal/70">
                        <svg className="w-5 h-5 text-deep-teal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {experience.participantRequirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    What to bring
                  </h3>
                  <ul className="space-y-1">
                    {experience.participantRequirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-charcoal/70">
                        <svg className="w-5 h-5 text-warm-amber flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {experience.safetyNotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    Safety notes
                  </h3>
                  <ul className="space-y-1">
                    {experience.safetyNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-charcoal/70">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {experience.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {experience.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-charcoal/70 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-charcoal mb-4">
                Available Sessions
              </h2>
              <div className="grid gap-3">
                {sessions.length === 0 && (
                  <p className="text-charcoal/50">No sessions available yet.</p>
                )}
                {sessions.map((s) => {
                  const isAvailable =
                    s.status === "scheduled" && s.remainingSpots > 0;
                  const isSelected = selectedSession === s._id;
                  return (
                    <button
                      key={s._id}
                      onClick={() => isAvailable && setSelectedSession(s._id)}
                      disabled={!isAvailable}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-deep-teal bg-deep-teal/5"
                          : isAvailable
                            ? "border-gray-200 hover:border-deep-teal/50"
                            : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-charcoal">
                            {new Date(s.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-charcoal/60">
                            {s.startTime} - {s.endTime}
                          </p>
                        </div>
                        <div className="text-right">
                          {isAvailable ? (
                            <span
                              className={`text-sm font-medium ${
                                s.remainingSpots <= 3
                                  ? "text-red-500"
                                  : "text-deep-teal"
                              }`}
                            >
                              {s.remainingSpots} spots left
                            </span>
                          ) : (
                            <span className="text-sm text-charcoal/40">Unavailable</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-charcoal mb-4">
                  Reviews ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="p-4 bg-white rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        {review.userName && (
                          <span className="text-sm font-medium text-charcoal">
                            {review.userName}
                          </span>
                        )}
                      </div>
                      <p className="text-charcoal/70">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-charcoal">
                  {experience.currency} {experience.pricePerParticipant}
                </span>
                <span className="text-charcoal/60">/ person</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Select session
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
                >
                  <option value="">Choose a session</option>
                  {availableSessions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {new Date(s.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {s.startTime} ({s.remainingSpots} spots)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Participants
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setParticipantCount(Math.max(1, participantCount - 1))
                    }
                    disabled={participantCount <= 1}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-charcoal hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold text-charcoal w-8 text-center">
                    {participantCount}
                  </span>
                  <button
                    onClick={() =>
                      setParticipantCount(
                        Math.min(
                          experience.defaultCapacity,
                          participantCount + 1
                        )
                      )
                    }
                    disabled={participantCount >= experience.defaultCapacity}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-charcoal hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-charcoal/70">
                  <span>
                    {experience.currency} {experience.pricePerParticipant} x{" "}
                    {participantCount}
                  </span>
                  <span>
                    {experience.currency} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-charcoal/70">
                  <span>Platform fee</span>
                  <span>
                    {experience.currency} {platformFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>
                    {experience.currency} {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleContinueToPayment}
                disabled={!selectedSession || bookingLoading}
                className="w-full py-3 bg-deep-teal text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bookingLoading
                  ? "Processing..."
                  : "Continue to Payment"}
              </button>

              {error && experience && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
