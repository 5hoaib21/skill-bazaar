"use client";

import Link from "next/link";

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div className="w-16 h-16 bg-warm-amber/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-warm-amber"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-charcoal">
              Payment Cancelled
            </h1>
            <p className="text-charcoal/70">
              Your payment was not completed. No charges have been made to your
              account. You can try again whenever you&apos;re ready.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 bg-deep-teal text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
            >
              Explore Experiences
            </Link>
            <Link
              href="/dashboard/bookings"
              className="block w-full py-3 border border-gray-200 text-charcoal font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
