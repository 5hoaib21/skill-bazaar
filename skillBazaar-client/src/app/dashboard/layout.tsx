"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/bookings", label: "My Bookings" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/become-a-host", label: "Become a Host" },
  { href: "/dashboard/host", label: "Host Dashboard" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-off-white gap-4">
        <p className="text-charcoal text-lg">Please sign in to access your dashboard.</p>
        <button
          onClick={() => { window.location.href = "/api/auth/signin"; }}
          className="px-6 py-2 bg-deep-teal text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <nav className="space-y-2">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-deep-teal text-white"
                    : "text-charcoal hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
