"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Booking } from "@/types";
import { BookingStatusBadge } from "@/components/ui/BookingStatusBadge";

export default function HostBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Booking[]>("/api/host/bookings");
        setBookings(data);
      } catch (err: any) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleComplete = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/api/bookings/${bookingId}/complete`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, bookingStatus: "completed" as const } : b
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to complete booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSession = async (bookingId: string) => {
    if (!confirm("Cancel this booking? This will refund the participant."))
      return;
    setActionLoading(bookingId);
    try {
      await api.patch(`/api/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, bookingStatus: "cancelled" as const, paymentStatus: "refunded" as const }
            : b
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setActionLoading(null);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Booking Management</h1>

      {bookings.length === 0 && (
        <p className="text-charcoal/50 text-center py-8">No bookings yet.</p>
      )}

      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BookingStatusBadge status={booking.bookingStatus} />
                  <span className="text-xs font-mono text-charcoal/50">
                    {booking.bookingReference}
                  </span>
                </div>
                <p className="text-sm text-charcoal/70">
                  {booking.participantCount} participant(s) |{" "}
                  {booking.currency} {booking.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-charcoal/50 mt-1">
                  Created: {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {booking.bookingStatus === "confirmed" && (
                  <button
                    onClick={() => handleComplete(booking._id)}
                    disabled={actionLoading === booking._id}
                    className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === booking._id ? "..." : "Mark Complete"}
                  </button>
                )}
                {(booking.bookingStatus === "pending_payment" ||
                  booking.bookingStatus === "confirmed") && (
                  <button
                    onClick={() => handleCancelSession(booking._id)}
                    disabled={actionLoading === booking._id}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === booking._id ? "..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
