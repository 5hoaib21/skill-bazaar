"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { HostProfile } from "@/types";

export default function AdminHostsPage() {
  const [hosts, setHosts] = useState<HostProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<HostProfile[]>("/api/admin/hosts");
        setHosts(data);
      } catch (err: any) {
        setError(err.message || "Failed to load hosts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleVerify = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.patch(`/api/admin/hosts/${userId}/verify`, {
        verificationStatus: "verified",
      });
      setHosts((prev) =>
        prev.map((h) =>
          h.userId === userId
            ? { ...h, verificationStatus: "verified" as const }
            : h
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Reject this host profile?")) return;
    setActionLoading(userId);
    try {
      await api.patch(`/api/admin/hosts/${userId}/verify`, {
        verificationStatus: "rejected",
      });
      setHosts((prev) =>
        prev.map((h) =>
          h.userId === userId
            ? { ...h, verificationStatus: "rejected" as const }
            : h
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      unverified: "bg-gray-100 text-charcoal/60",
      verified: "bg-deep-teal/10 text-deep-teal",
      rejected: "bg-red-100 text-red-600",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[status] || "bg-gray-100 text-charcoal/60"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal">Host Verification</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-3">
        {hosts.map((host) => (
          <div
            key={host._id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-charcoal">
                    {host.displayName}
                  </h3>
                  {statusBadge(host.verificationStatus)}
                </div>
                <p className="text-sm text-charcoal/60">
                  {host.city} | {host.languages?.join(", ")}
                </p>
                <p className="text-sm text-charcoal/60">
                  Skills: {host.skills?.join(", ")}
                </p>
                {host.bio && (
                  <p className="text-sm text-charcoal/50 mt-1 line-clamp-2">
                    {host.bio}
                  </p>
                )}
                <p className="text-xs text-charcoal/40 mt-1">
                  Phone: {host.phone} | Stripe:{" "}
                  {host.stripeOnboardingComplete ? "Connected" : "Not connected"}
                </p>
              </div>

              <div className="flex gap-2">
                {host.verificationStatus !== "verified" && (
                  <button
                    onClick={() => handleVerify(host.userId)}
                    disabled={actionLoading === host.userId}
                    className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === host.userId ? "..." : "Verify"}
                  </button>
                )}
                {(host.verificationStatus === "unverified" ||
                  host.verificationStatus === "verified") && (
                  <button
                    onClick={() => handleReject(host.userId)}
                    disabled={actionLoading === host.userId}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === host.userId ? "..." : "Reject"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {hosts.length === 0 && (
          <p className="text-charcoal/50 text-center py-8">
            No host profiles yet.
          </p>
        )}
      </div>
    </div>
  );
}
