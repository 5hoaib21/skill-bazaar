"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();
  console.log('session:',session);
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-deep-teal rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-charcoal">VolunteerConnect</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors">Home</Link>
            <Link href="/opportunities" className="text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors">Explore</Link>
            <Link href="/about" className="text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors">About</Link>
            <Link href="/contact" className="text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors">Contact</Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors">Dashboard</Link>
                <Link href="/add-opportunity" className="px-4 py-2 bg-deep-teal text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                  Add Opportunity
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-charcoal/50 hover:text-charcoal transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors">Login</Link>
                <Link href="/register" className="px-4 py-2 bg-deep-teal text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <Link href="/" className="block text-sm font-medium text-charcoal/70 hover:text-charcoal" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/opportunities" className="block text-sm font-medium text-charcoal/70 hover:text-charcoal" onClick={() => setMobileOpen(false)}>Explore</Link>
            <Link href="/about" className="block text-sm font-medium text-charcoal/70 hover:text-charcoal" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/contact" className="block text-sm font-medium text-charcoal/70 hover:text-charcoal" onClick={() => setMobileOpen(false)}>Contact</Link>
            {session?.user ? (
              <>
                <Link href="/dashboard" className="block text-sm font-medium text-charcoal/70 hover:text-charcoal" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/add-opportunity" className="block text-sm font-medium text-deep-teal" onClick={() => setMobileOpen(false)}>Add Opportunity</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block text-sm font-medium text-charcoal/50 hover:text-charcoal">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm font-medium text-charcoal/70 hover:text-charcoal" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/register" className="block text-sm font-medium text-deep-teal" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
