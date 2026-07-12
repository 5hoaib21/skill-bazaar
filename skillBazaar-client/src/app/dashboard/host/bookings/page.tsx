"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Booking } from "@/types";

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

  const handleMarkAttendance = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const updated = await api.patch<Booking>(
        `/api/host/bookings/${bookingId}/attendance`,
        { attended: true }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? updated : b))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update attendance");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const updated = await api.patch<Booking>(
        `/api/host/bookings/${bookingId}/complete`,
        {}
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? updated : b))
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
      const updated = await api.patch<Booking>(
        `/api/host/bookings/${bookingId}/cancel`,
        {}
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? updated : b))
      );
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  const groupedByExperience = bookings.reduce<
    Record<string, Booking[]>
  >((acc, booking) => {
    const key = booking.experience?.title || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(booking);
    return acc;
  }, {});

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-warm-amber/10 text-warm-amber",
      confirmed: "bg-deep-teal/10 text-deep-teal",
      cancelled: "bg-red-100 text-red-600",
      completed: "bg-green-100 text-green-600",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[status] || "bg-gray-100 text-charcoal/60"
        }`}
      >
        {status}
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

      {Object.entries(groupedByExperience).map(
        ([experienceTitle, expBookings]) => (
          <div key={experienceTitle} className="space-y-3">
            <h2 className="text-lg font-semibold text-charcoal">
              {experienceTitle}
            </h2>
            <div className="space-y-2">
              {expBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {statusBadge(booking.status)}
                        <span className="text-xs text-charcoal/50">
                          {booking.reference}
                        </span>
                      </div>
                      <p className="text-sm text-charcoal/70">
                        {booking.session?.date
                          ? new Date(booking.session.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : ""}{" "}
                        {booking.session?.startTime} |{" "}
                        {booking.participantCount} participant(s) | $
                        {booking.totalAmount}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleMarkAttendance(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="px-3 py-1.5 text-sm font-medium text-deep-teal border border-deep-teal rounded-lg hover:bg-deep-teal/5 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === booking._id
                            ? "..."
                            : "Mark Attendance"}
                        </button>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleComplete(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === booking._id
                            ? "..."
                            : "Mark Complete"}
                        </button>
                      )}
                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelSession(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === booking._id
                            ? "..."
                            : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
