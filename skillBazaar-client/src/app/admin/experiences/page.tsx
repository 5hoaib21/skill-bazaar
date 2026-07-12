"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Experience } from "@/types";

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Experience[]>("/api/admin/experiences");
        setExperiences(data);
      } catch (err: any) {
        setError(err.message || "Failed to load experiences");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/api/admin/experiences/${id}/approve`);
      setExperiences((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, status: "published" as const } : e
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(id);
    try {
      await api.patch(`/api/admin/experiences/${id}/reject`, {
        reason: rejectReason,
      });
      setExperiences((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, status: "rejected" as const } : e
        )
      );
      setRejectId(null);
      setRejectReason("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-charcoal/60",
      published: "bg-deep-teal/10 text-deep-teal",
      rejected: "bg-red-100 text-red-600",
      archived: "bg-warm-amber/10 text-warm-amber",
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

  const filtered = experiences.filter(
    (e) => statusFilter === "all" || e.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal">
        Experience Moderation
      </h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        {["all", "draft", "published", "rejected", "archived"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? "bg-deep-teal text-white"
                  : "bg-white text-charcoal border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((exp) => (
          <div
            key={exp._id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-charcoal truncate">
                    {exp.title}
                  </h3>
                  {statusBadge(exp.status)}
                </div>
                <p className="text-sm text-charcoal/60">
                  {exp.location.city}
                  {exp.location.area && `, ${exp.location.area}`} |{" "}
                  {exp.durationMinutes} min | ${exp.pricePerParticipant}/person
                </p>
                <p className="text-xs text-charcoal/40 mt-1">
                  Created:{" "}
                  {new Date(exp.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(exp.status === "draft" || exp.status === "rejected") && (
                  <button
                    onClick={() => handleApprove(exp._id)}
                    disabled={actionLoading === exp._id}
                    className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === exp._id ? "..." : "Approve"}
                  </button>
                )}
                {(exp.status === "draft" || exp.status === "published") && (
                  <button
                    onClick={() => setRejectId(exp._id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>

            {rejectId === exp._id && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 items-start">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
                />
                <button
                  onClick={() => handleReject(exp._id)}
                  disabled={!rejectReason.trim() || actionLoading === exp._id}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === exp._id ? "..." : "Confirm"}
                </button>
                <button
                  onClick={() => {
                    setRejectId(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-charcoal border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
