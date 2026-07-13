"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Booking } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminBookingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (filter) params.set("status", filter);
        const result = await api.get<{ data: Booking[]; meta: { totalPages: number } }>(
          `/api/admin/bookings?${params}`
        );
        setBookings(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
      } catch (err: any) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, [session, filter, page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending_payment": return "bg-yellow-100 text-yellow-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "completed": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

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
        <h1 className="text-2xl font-bold text-charcoal">Bookings</h1>
        <Link href="/admin" className="text-sm font-medium text-deep-teal hover:text-deep-teal/80">
          &larr; Back to Admin
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {["", "confirmed", "pending_payment", "cancelled", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? "bg-deep-teal text-white"
                : "bg-white border border-gray-200 text-charcoal hover:bg-gray-50"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {bookings.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-charcoal">{booking.bookingReference}</td>
                  <td className="px-6 py-4 text-charcoal/70 text-sm">{booking.userId}</td>
                  <td className="px-6 py-4 text-charcoal">{booking.participantCount}</td>
                  <td className="px-6 py-4 font-medium text-charcoal">
                    {booking.currency} {booking.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No bookings found" description="No bookings match your filter." />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-charcoal/60">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
