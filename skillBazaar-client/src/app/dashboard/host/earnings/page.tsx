"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Booking } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

interface EarningsData {
  totalBookings: number;
  grossAmount: number;
  platformFees: number;
  netEarnings: number;
  byExperience: Record<string, { title: string; count: number; earnings: number }>;
}

export default function HostEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const bookings = await api.get<Booking[]>("/api/host/bookings");

        const completed = bookings.filter((b) => b.bookingStatus === "completed");

        const byExperience: Record<string, { title: string; count: number; earnings: number }> = {};
        let grossAmount = 0;
        let platformFees = 0;
        let netEarnings = 0;

        for (const booking of completed) {
          grossAmount += booking.totalAmount;
          platformFees += booking.platformFeeAmount;
          netEarnings += booking.hostEarningAmount;

          const expId = booking.experienceId;
          if (!byExperience[expId]) {
            byExperience[expId] = { title: "Experience", count: 0, earnings: 0 };
          }
          byExperience[expId].count++;
          byExperience[expId].earnings += booking.hostEarningAmount;
        }

        setEarnings({
          totalBookings: completed.length,
          grossAmount,
          platformFees,
          netEarnings,
          byExperience,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load earnings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Earnings</h1>
        <Link
          href="/dashboard/host/payouts"
          className="text-sm font-medium text-deep-teal hover:text-deep-teal/80"
        >
          View Payouts &rarr;
        </Link>
      </div>

      {earnings && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-charcoal/60">Total Bookings</p>
              <p className="text-2xl font-bold text-charcoal mt-1">
                {earnings.totalBookings}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-charcoal/60">Gross Amount</p>
              <p className="text-2xl font-bold text-charcoal mt-1">
                BDT {earnings.grossAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-charcoal/60">Platform Fees</p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                - BDT {earnings.platformFees.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-deep-teal/20 p-6 bg-deep-teal/5">
              <p className="text-sm text-deep-teal/80">Net Earnings</p>
              <p className="text-2xl font-bold text-deep-teal mt-1">
                BDT {earnings.netEarnings.toLocaleString()}
              </p>
            </div>
          </div>

          {Object.keys(earnings.byExperience).length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-charcoal">Earnings by Experience</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {Object.entries(earnings.byExperience).map(([expId, data]) => (
                  <div key={expId} className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-charcoal">{data.title}</p>
                      <p className="text-sm text-charcoal/50">{data.count} bookings</p>
                    </div>
                    <p className="font-semibold text-deep-teal">
                      BDT {data.earnings.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No earnings yet"
              description="Complete bookings to start earning."
            />
          )}
        </>
      )}
    </div>
  );
}
