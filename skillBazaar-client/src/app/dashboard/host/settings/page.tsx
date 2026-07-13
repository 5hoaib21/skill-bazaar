"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { HostProfile } from "@/types";

export default function HostSettingsPage() {
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    skills: "",
    languages: "",
    city: "",
    phone: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<HostProfile>("/api/hosts/me");
        setProfile(data);
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          skills: data.skills?.join(", ") || "",
          languages: data.languages?.join(", ") || "",
          city: data.city || "",
          phone: data.phone || "",
        });
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.patch("/api/hosts/me", {
        displayName: form.displayName,
        bio: form.bio,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
        city: form.city,
        phone: form.phone,
      });
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Host profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-charcoal">Host Settings</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
            placeholder="Tell explorers about yourself and your experience..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Skills
          </label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
            placeholder="Cooking, Photography, Music (comma-separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Languages
          </label>
          <input
            type="text"
            value={form.languages}
            onChange={(e) => setForm({ ...form, languages: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
            placeholder="English, Bengali (comma-separated)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-deep-teal text-white font-medium rounded-lg hover:bg-deep-teal/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <div className="text-sm text-charcoal/50">
            <span className={`inline-flex items-center gap-1 ${
              profile.verificationStatus === "verified"
                ? "text-green-600"
                : profile.verificationStatus === "rejected"
                ? "text-red-600"
                : "text-charcoal/50"
            }`}>
              Verification: {profile.verificationStatus}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
