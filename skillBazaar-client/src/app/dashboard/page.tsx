"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { Booking } from "@/types";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const data = await api.get<Booking[]>("/api/bookings/me");
        setBookings(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );
  const completed = bookings.filter((b) => b.status === "completed");

  const stats = [
    { label: "Total Bookings", value: bookings.length },
    { label: "Upcoming Sessions", value: upcoming.length },
    { label: "Completed", value: completed.length },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <p className="text-3xl font-bold text-deep-teal">{stat.value}</p>
            <p className="text-sm text-charcoal/60">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/bookings"
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
        >
          <h3 className="font-semibold text-charcoal">My Bookings</h3>
          <p className="text-sm text-charcoal/60 mt-1">
            View and manage all your bookings
          </p>
        </Link>
        <Link
          href="/dashboard/profile"
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
        >
          <h3 className="font-semibold text-charcoal">Profile</h3>
          <p className="text-sm text-charcoal/60 mt-1">
            Update your personal information
          </p>
        </Link>
        <Link
          href="/dashboard/become-a-host"
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
        >
          <h3 className="font-semibold text-charcoal">Become a Host</h3>
          <p className="text-sm text-charcoal/60 mt-1">
            Create and manage your own experiences
          </p>
        </Link>
        <Link
          href="/dashboard/host"
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
        >
          <h3 className="font-semibold text-charcoal">Host Dashboard</h3>
          <p className="text-sm text-charcoal/60 mt-1">
            Manage your listings, sessions, and earnings
          </p>
        </Link>
      </div>

      {!loading && upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-charcoal mb-3">
            Upcoming Bookings
          </h2>
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((booking) => (
              <Link
                key={booking._id}
                href={`/dashboard/bookings/${booking._id}`}
                className="block bg-white p-4 rounded-xl border border-gray-200 hover:border-deep-teal transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-charcoal">
                      {booking.experience?.title || "Experience"}
                    </p>
                    <p className="text-sm text-charcoal/60">
                      {booking.session?.date
                        ? new Date(booking.session.date).toLocaleDateString()
                        : ""}{" "}
                      - {booking.participantCount} participant(s)
                    </p>
                  </div>
                  <span className="text-sm font-medium text-deep-teal">
                    {booking.currency || ""} {booking.totalAmount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
