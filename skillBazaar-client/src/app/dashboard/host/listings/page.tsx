"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Experience } from "@/types";

export default function HostListingsPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Experience[]>("/api/experiences?hostSelf=true");
        setExperiences(data);
      } catch (err: any) {
        setError(err.message || "Failed to load experiences");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const handleStatusAction = async (
    id: string,
    action: "publish" | "archive"
  ) => {
    try {
      await api.patch(`/api/experiences/${id}`, {
        status: action === "publish" ? "published" : "archived",
      });
      setExperiences((prev) =>
        prev.map((e) =>
          e._id === id
            ? { ...e, status: action === "publish" ? "published" : "archived" as Experience["status"] }
            : e
        )
      );
    } catch (err: any) {
      setError(err.message);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">My Listings</h1>
        <Link
          href="/dashboard/host/listings/new"
          className="px-4 py-2 bg-deep-teal text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Create New
        </Link>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {experiences.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-charcoal/60 mb-4">No experiences yet.</p>
          <Link
            href="/dashboard/host/listings/new"
            className="text-deep-teal hover:underline font-medium"
          >
            Create your first experience
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {experiences.map((exp) => (
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
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/host/listings/${exp._id}/edit`}
                  className="px-3 py-1.5 text-sm font-medium text-deep-teal border border-deep-teal rounded-lg hover:bg-deep-teal/5 transition-colors"
                >
                  Edit
                </Link>
                {exp.status === "draft" && (
                  <button
                    onClick={() => handleStatusAction(exp._id, "publish")}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-deep-teal rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Publish
                  </button>
                )}
                {exp.status === "published" && (
                  <button
                    onClick={() => handleStatusAction(exp._id, "archive")}
                    className="px-3 py-1.5 text-sm font-medium text-warm-amber border border-warm-amber rounded-lg hover:bg-warm-amber/5 transition-colors"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
