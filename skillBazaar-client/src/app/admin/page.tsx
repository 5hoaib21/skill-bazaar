"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function AdminDashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  if (!session) {
    window.location.href = "/api/auth/signin";
    return null;
  }

  const sections = [
    {
      title: "Experiences",
      description: "Moderate and manage all experiences",
      href: "/admin/experiences",
      icon: "Experience",
    },
    {
      title: "Hosts",
      description: "Verify host profiles",
      href: "/admin/hosts",
      icon: "Host",
    },
    {
      title: "Users",
      description: "Manage user accounts",
      href: "/admin/users",
      icon: "User",
    },
    {
      title: "Bookings",
      description: "View all bookings",
      href: "/admin/bookings",
      icon: "Booking",
    },
    {
      title: "Categories",
      description: "Manage experience categories",
      href: "/admin/categories",
      icon: "Category",
    },
    {
      title: "Reports",
      description: "Review user reports",
      href: "/admin/reports",
      icon: "Report",
    },
  ];

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-charcoal mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
            >
              <h2 className="text-lg font-semibold text-charcoal mb-1">
                {section.title}
              </h2>
              <p className="text-sm text-charcoal/60">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
