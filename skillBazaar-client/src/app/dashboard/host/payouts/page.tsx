"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

interface StripeConnectStatus {
  connected: boolean;
  accountId?: string;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export default function HostPayoutsPage() {
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await api.get<StripeConnectStatus>("/api/stripe/connect/status");
        setStatus(result);
      } catch (err: any) {
        setError(err.message || "Failed to load payout status");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      if (!status?.connected) {
        await api.post("/api/stripe/connect/account");
      }
      const result = await api.post<{ url: string }>("/api/stripe/connect/onboarding-link");
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect Stripe");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-charcoal">Payouts</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {searchParams.get("onboarding") === "complete" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          Stripe onboarding completed! Your payout account is now being set up.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-4">
          Stripe Connect Account
        </h2>

        {!status?.connected ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-warm-amber/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warm-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-charcoal/60 mb-4">
              Connect your Stripe account to receive payouts for your experiences.
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-6 py-3 bg-warm-amber text-white font-medium rounded-lg hover:bg-warm-amber/90 transition-colors disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Stripe Account"}
            </button>
          </div>
        ) : !status.onboardingComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-warm-amber/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warm-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-charcoal/60 mb-4">
              Your Stripe onboarding is incomplete. Please complete the setup to receive payouts.
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-6 py-3 bg-warm-amber text-white font-medium rounded-lg hover:bg-warm-amber/90 transition-colors disabled:opacity-50"
            >
              {connecting ? "Loading..." : "Complete Onboarding"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700 font-medium">Account Connected</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-charcoal/60">Charges Enabled</p>
                <p className={`font-medium ${status.chargesEnabled ? "text-green-600" : "text-charcoal/40"}`}>
                  {status.chargesEnabled ? "Yes" : "No"}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-charcoal/60">Payouts Enabled</p>
                <p className={`font-medium ${status.payoutsEnabled ? "text-green-600" : "text-charcoal/40"}`}>
                  {status.payoutsEnabled ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {status.accountId && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-charcoal/60">Account ID</p>
                <p className="font-mono text-sm text-charcoal">{status.accountId}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-4 py-2 text-sm font-medium text-deep-teal border border-deep-teal rounded-lg hover:bg-deep-teal/5 transition-colors disabled:opacity-50"
            >
              {connecting ? "Loading..." : "Refresh Account Status"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-4">
          How Payouts Work
        </h2>
        <div className="space-y-3 text-sm text-charcoal/70">
          <p>1. When a booking is confirmed, the payment is held in your Stripe account.</p>
          <p>2. Stripe automatically transfers funds to your bank account based on your payout schedule.</p>
          <p>3. Platform fees are deducted from each booking before transfer.</p>
          <p>4. You can view your payout history in your Stripe dashboard.</p>
        </div>
      </div>
    </div>
  );
}
