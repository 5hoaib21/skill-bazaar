"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Booking } from "@/types";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const data = await api.get<Booking>(`/api/bookings/${params.id}`);
        setBooking(data);
      } catch (err: any) {
        setError(err.message || "Failed to load booking");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-warm-amber/10 text-warm-amber",
      confirmed: "bg-deep-teal/10 text-deep-teal",
      cancelled: "bg-red-100 text-red-600",
      completed: "bg-green-100 text-green-600",
    };
    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${
          colors[status] || "bg-gray-100 text-charcoal/60"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || "Booking not found"}</p>
        <Link
          href="/dashboard/bookings"
          className="text-deep-teal hover:underline mt-4 inline-block"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/bookings"
        className="text-deep-teal hover:underline text-sm flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to bookings
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-charcoal">Booking Details</h1>
          {statusBadge(booking.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-sm text-charcoal/50">Reference</span>
              <p className="font-mono font-medium text-charcoal">
                {booking.reference}
              </p>
            </div>
            <div>
              <span className="text-sm text-charcoal/50">Experience</span>
              <p className="font-medium text-charcoal">
                {booking.experience?.title || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-charcoal/50">Session Date</span>
              <p className="font-medium text-charcoal">
                {booking.session?.date
                  ? new Date(booking.session.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-charcoal/50">Time</span>
              <p className="font-medium text-charcoal">
                {booking.session?.startTime} - {booking.session?.endTime}
              </p>
            </div>
            <div>
              <span className="text-sm text-charcoal/50">Participants</span>
              <p className="font-medium text-charcoal">
                {booking.participantCount}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-sm text-charcoal/50">Booking Status</span>
              <p className="font-medium text-charcoal">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </p>
            </div>
            <div>
              <span className="text-sm text-charcoal/50">Payment Status</span>
              <p className="font-medium text-charcoal">
                {booking.paymentStatus.charAt(0).toUpperCase() +
                  booking.paymentStatus.slice(1)}
              </p>
            </div>
            {booking.hostProfile && (
              <div>
                <span className="text-sm text-charcoal/50">Host</span>
                <p className="font-medium text-charcoal">
                  {booking.hostProfile.displayName}
                </p>
              </div>
            )}
            {booking.experience?.location?.address && (
              <div>
                <span className="text-sm text-charcoal/50">Location</span>
                <p className="font-medium text-charcoal">
                  {booking.experience.location.address}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-charcoal mb-3">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-charcoal/70">
              <span>
                Price per participant x {booking.participantCount}
              </span>
              <span>${(booking.totalAmount - booking.platformFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal/70">
              <span>Platform fee</span>
              <span>${booking.platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-charcoal mb-2">
            Cancellation Policy
          </h3>
          <p className="text-sm text-charcoal/70">
            Free cancellation up to 48 hours before the session. 50% refund
            between 24-48 hours. No refund within 24 hours of the session.
          </p>
          {(booking.status === "pending" ||
            booking.status === "confirmed") && (
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to cancel this booking?"
                  )
                ) {
                  api
                    .patch(`/api/bookings/${params.id}/cancel`)
                    .then(() => {
                      setBooking((prev) =>
                        prev
                          ? { ...prev, status: "cancelled" as const }
                          : prev
                      );
                    })
                    .catch((err) => setError(err.message));
                }
              }}
              className="mt-3 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
