"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { HostProfile } from "@/types";

export default function BecomeHostPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [onboardingUrl, setOnboardingUrl] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    skills: "",
    languages: "",
    city: "",
    phone: "",
  });

  useEffect(() => {
    if (!session && !isPending) {
      window.location.href = "/api/auth/signin";
      return;
    }
    (async () => {
      try {
        const existing = await api.get<HostProfile>("/api/hosts/me");
        setProfile(existing);
        setForm({
          displayName: existing.displayName || "",
          bio: existing.bio || "",
          skills: existing.skills?.join(", ") || "",
          languages: existing.languages?.join(", ") || "",
          city: existing.city || "",
          phone: existing.phone || "",
        });
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [session, isPending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      };

      if (profile) {
        await api.patch("/api/hosts/me", payload);
        setMessage("Profile updated successfully.");
      } else {
        await api.post("/api/hosts/profile", payload);
        setMessage("Host profile created! Now set up payments.");
        setProfile({ _id: "temp", userId: "", displayName: "", bio: "", skills: [], languages: [], city: "", phone: "", stripeOnboardingComplete: false, verificationStatus: "unverified", createdAt: "", updatedAt: "" });
      }
    } catch (err: any) {
      setMessage(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleStripeConnect = async () => {
    setMessage("");
    try {
      const account: any = await api.post("/api/stripe/connect/account");
      const link: any = await api.post("/api/stripe/connect/onboarding-link");
      setOnboardingUrl(link.url);
      window.open(link.url, "_blank");
    } catch (err: any) {
      setMessage(err.message || "Failed to initialize Stripe Connect.");
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">
        {profile ? "Your Host Profile" : "Become a Host"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) =>
              setForm({ ...form, displayName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Skills (comma separated)
          </label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="Cooking, Painting, Guitar"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Languages (comma separated)
          </label>
          <input
            type="text"
            value={form.languages}
            onChange={(e) => setForm({ ...form, languages: e.target.value })}
            placeholder="English, Spanish"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            City
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
          />
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.includes("success") || message.includes("created")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-deep-teal text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {saving
            ? "Saving..."
            : profile
              ? "Update Profile"
              : "Create Host Profile"}
        </button>
      </form>

      {profile && !profile.stripeOnboardingComplete && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-charcoal">
            Payment Setup
          </h2>
          <p className="text-sm text-charcoal/70">
            Connect your Stripe account to receive payouts from bookings.
          </p>
          <button
            onClick={handleStripeConnect}
            className="w-full py-2 bg-warm-amber text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            Connect Stripe
          </button>
          {onboardingUrl && (
            <p className="text-xs text-charcoal/50">
              Stripe onboarding opened in a new tab. Complete the setup there.
            </p>
          )}
        </div>
      )}

      {profile?.stripeOnboardingComplete && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-green-600">
              Stripe connected
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => router.push("/dashboard/host/listings")}
          className="flex-1 py-2 text-deep-teal border border-deep-teal font-medium rounded-lg hover:bg-deep-teal/5 transition-colors"
        >
          Manage Listings
        </button>
      </div>
    </div>
  );
}
