"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface HostDashboardData {
  totalExperiences: number;
  upcomingSessions: number;
  pendingBookings: number;
  completedBookings: number;
  grossAmount: number;
  platformFees: number;
  estimatedEarnings: number;
}

export default function HostDashboardPage() {
  const [data, setData] = useState<HostDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const result = await api.get<HostDashboardData>("/api/host/dashboard");
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
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

  const statsCards = data
    ? [
        { label: "Published Experiences", value: data.totalExperiences },
        { label: "Upcoming Sessions", value: data.upcomingSessions },
        { label: "Pending Bookings", value: data.pendingBookings },
        { label: "Completed Bookings", value: data.completedBookings },
      ]
    : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-charcoal">Host Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <p className="text-3xl font-bold text-deep-teal">{stat.value}</p>
            <p className="text-sm text-charcoal/60 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {data && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-4">
            Earnings Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-charcoal/50">Gross Booking Amount</p>
              <p className="text-2xl font-bold text-charcoal">
                ${data.grossAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-charcoal/50">Platform Fees</p>
              <p className="text-2xl font-bold text-charcoal">
                -${data.platformFees.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-charcoal/50">Estimated Earnings</p>
              <p className="text-2xl font-bold text-deep-teal">
                ${data.estimatedEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/host/listings"
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
        >
          <h3 className="font-semibold text-charcoal">Listings</h3>
          <p className="text-sm text-charcoal/60 mt-1">
            Create and manage experiences
          </p>
        </Link>
        <Link
          href="/dashboard/host/sessions"
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
        >
          <h3 className="font-semibold text-charcoal">Sessions</h3>
          <p className="text-sm text-charcoal/60 mt-1">
            Manage session schedules
          </p>
        </Link>
        <Link
          href="/dashboard/host/bookings"
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
        >
          <h3 className="font-semibold text-charcoal">Bookings</h3>
          <p className="text-sm text-charcoal/60 mt-1">
            View and manage bookings
          </p>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard/host/listings/new"
          className="px-6 py-3 bg-deep-teal text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
        >
          Create New Experience
        </Link>
      </div>
    </div>
  );
}
