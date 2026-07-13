"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Booking } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminRefundsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const allBookings = await api.get<Booking[]>("/api/admin/bookings?limit=100");
        const refunded = allBookings.filter(
          (b: Booking) => b.paymentStatus === "refunded" || b.paymentStatus === "partially_refunded"
        );
        setBookings(refunded);
      } catch (err: any) {
        setError(err.message || "Failed to load refunds");
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Refunds</h1>
        <Link href="/admin" className="text-sm font-medium text-deep-teal hover:text-deep-teal/80">
          &larr; Back to Admin
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {bookings.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Refund IDs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-charcoal">{booking.bookingReference}</td>
                  <td className="px-6 py-4 font-medium text-charcoal">
                    {booking.currency} {booking.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.paymentStatus === "refunded"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal/70">
                    {booking.stripe?.refundIds?.length || 0} refund(s)
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal/50">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No refunds" description="No refunded bookings found." />
      )}
    </div>
  );
}
