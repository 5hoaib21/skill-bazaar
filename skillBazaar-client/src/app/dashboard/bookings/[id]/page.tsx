"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Booking } from "@/types";
import { BookingStatusBadge } from "@/components/ui/BookingStatusBadge";

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

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/api/bookings/${params.id}/cancel`);
      setBooking((prev) =>
        prev ? { ...prev, bookingStatus: "cancelled", paymentStatus: "refunded" } : prev
      );
    } catch (err: any) {
      setError(err.message);
    }
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
          <BookingStatusBadge status={booking.bookingStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-sm text-charcoal/50">Reference</span>
              <p className="font-mono font-medium text-charcoal">
                {booking.bookingReference}
              </p>
            </div>
            <div>
              <span className="text-sm text-charcoal/50">Participants</span>
              <p className="font-medium text-charcoal">
                {booking.participantCount}
              </p>
            </div>
            <div>
              <span className="text-sm text-charcoal/50">Created</span>
              <p className="font-medium text-charcoal">
                {new Date(booking.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-sm text-charcoal/50">Payment Status</span>
              <p className="font-medium text-charcoal">
                {booking.paymentStatus.charAt(0).toUpperCase() +
                  booking.paymentStatus.slice(1).replace(/_/g, " ")}
              </p>
            </div>
            {booking.cancellation?.cancelledAt && (
              <div>
                <span className="text-sm text-charcoal/50">Cancelled</span>
                <p className="font-medium text-red-600">
                  {new Date(booking.cancellation.cancelledAt).toLocaleDateString()}
                  {booking.cancellation.reason && ` - ${booking.cancellation.reason}`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-charcoal mb-3">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-charcoal/70">
              <span>Subtotal</span>
              <span>{booking.currency} {booking.subtotalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-charcoal/70">
              <span>Platform fee</span>
              <span>{booking.currency} {booking.platformFeeAmount.toLocaleString()}</span>
            </div>
            {booking.taxAmount > 0 && (
              <div className="flex justify-between text-charcoal/70">
                <span>Tax</span>
                <span>{booking.currency} {booking.taxAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{booking.currency} {booking.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-deep-teal">
              <span>Host earning</span>
              <span>{booking.currency} {booking.hostEarningAmount.toLocaleString()}</span>
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
          {(booking.bookingStatus === "pending_payment" ||
            booking.bookingStatus === "confirmed") && (
            <button
              onClick={handleCancel}
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
