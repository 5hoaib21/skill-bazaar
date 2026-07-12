"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const navLinks = (
    <>
      <Link href="/explore" className="hover:text-warm-amber transition-colors">Explore</Link>
      <Link href="/#how-it-works" className="hover:text-warm-amber transition-colors">How It Works</Link>
      <Link href="/dashboard/become-a-host" className="hover:text-warm-amber transition-colors">Become a Host</Link>
    </>
  );

  const authLinks = session ? (
    <>
      <Link href="/dashboard/bookings" className="hover:text-warm-amber transition-colors">My Bookings</Link>
      <Link href="/dashboard/host" className="hover:text-warm-amber transition-colors">Host Dashboard</Link>
      <Link href="/dashboard/profile" className="hover:text-warm-amber transition-colors">Profile</Link>
      <button onClick={handleLogout} className="hover:text-warm-amber transition-colors">Logout</button>
    </>
  ) : (
    <>
      <Link href="/login" className="hover:text-warm-amber transition-colors">Login</Link>
      <Link href="/register" className="bg-warm-amber text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Register</Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-deep-teal">SkillBazaar</Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks}
            {!isPending && authLinks}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 flex flex-col gap-3 pt-3">
          {navLinks}
          {!isPending && authLinks}
        </div>
      )}
    </nav>
  );
}
