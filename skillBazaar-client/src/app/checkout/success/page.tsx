"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Content() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("booking");

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-charcoal">
              Booking Confirmed!
            </h1>
            <p className="text-charcoal/70">
              Thank you for your booking. Your experience is confirmed and
              ready to go.
            </p>
          </div>

          {reference && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-charcoal/50">Reference Number</p>
              <p className="font-mono font-bold text-charcoal text-lg">
                {reference}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/dashboard/bookings"
              className="block w-full py-3 bg-deep-teal text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="block w-full py-3 border border-gray-200 text-charcoal font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Explore More Experiences
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-off-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" /></div>}>
      <Content />
    </Suspense>
  );
}
