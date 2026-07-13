"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Booking } from "@/types";
import { BookingStatusBadge } from "@/components/ui/BookingStatusBadge";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Booking[]>("/api/bookings/me");
        setBookings(data);
      } catch (err: any) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    try {
      await api.patch(`/api/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id
            ? { ...b, bookingStatus: "cancelled" as const, paymentStatus: "refunded" as const }
            : b
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const canCancel = (booking: Booking) =>
    booking.bookingStatus === "pending_payment" || booking.bookingStatus === "confirmed";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">My Bookings</h1>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-charcoal/60 mb-4">No bookings yet.</p>
          <Link
            href="/"
            className="text-deep-teal hover:underline font-medium"
          >
            Explore experiences
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((booking) => {
          const isExpanded = expandedId === booking._id;
          return (
            <div
              key={booking._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                className="w-full text-left p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-charcoal truncate">
                    Booking {booking.bookingReference}
                  </p>
                  <p className="text-sm text-charcoal/60">
                    {booking.participantCount} participant(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-charcoal">
                    {booking.currency} {booking.totalAmount.toLocaleString()}
                  </span>
                  <BookingStatusBadge status={booking.bookingStatus} />
                  <svg
                    className={`w-5 h-5 text-charcoal/40 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-charcoal/50">Reference</span>
                      <p className="font-mono font-medium text-charcoal">
                        {booking.bookingReference}
                      </p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">Payment</span>
                      <p className="font-medium text-charcoal">
                        {booking.paymentStatus.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">Participants</span>
                      <p className="font-medium text-charcoal">
                        {booking.participantCount}
                      </p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">Subtotal</span>
                      <p className="font-medium text-charcoal">
                        {booking.currency} {booking.subtotalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">Platform Fee</span>
                      <p className="font-medium text-charcoal">
                        {booking.currency} {booking.platformFeeAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">Total</span>
                      <p className="font-semibold text-charcoal">
                        {booking.currency} {booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/dashboard/bookings/${booking._id}`}
                      className="px-4 py-2 text-sm font-medium text-deep-teal border border-deep-teal rounded-lg hover:bg-deep-teal/5 transition-colors"
                    >
                      View Details
                    </Link>
                    {canCancel(booking) && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {cancellingId === booking._id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
