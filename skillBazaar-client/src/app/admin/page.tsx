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
      count: "Moderate",
    },
    {
      title: "Hosts",
      description: "Verify host profiles",
      href: "/admin/hosts",
      count: "Verify",
    },
    {
      title: "Reports",
      description: "Review user reports",
      href: "/admin/reports",
      count: "Review",
    },
  ];

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-charcoal mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {sections.map((section) => (
            <div
              key={section.href}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <p className="text-3xl font-bold text-deep-teal">
                {section.count}
              </p>
              <p className="text-sm text-charcoal/60 mt-1">
                {section.title}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-deep-teal transition-colors"
            >
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                {section.title}
              </h2>
              <p className="text-charcoal/60">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
