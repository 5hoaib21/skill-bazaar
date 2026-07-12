"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Report } from "@/types";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Report[]>("/api/admin/reports");
        setReports(data);
      } catch (err: any) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdateStatus = async (
    reportId: string,
    status: "reviewing" | "resolved" | "dismissed"
  ) => {
    setActionLoading(reportId);
    try {
      await api.patch(`/api/admin/reports/${reportId}`, { status });
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status } : r))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-warm-amber/10 text-warm-amber",
      reviewing: "bg-blue-100 text-blue-600",
      resolved: "bg-green-100 text-green-600",
      dismissed: "bg-gray-100 text-charcoal/60",
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
      <h1 className="text-2xl font-bold text-charcoal">Reports</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report._id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-charcoal/70 rounded-full uppercase">
                    {report.type}
                  </span>
                  {statusBadge(report.status)}
                </div>
                <p className="font-medium text-charcoal">{report.reason}</p>
                <p className="text-sm text-charcoal/70 mt-1">
                  {report.description}
                </p>
                <p className="text-xs text-charcoal/40 mt-1">
                  Target: {report.targetId} | Reported:{" "}
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {report.status === "pending" && (
                  <button
                    onClick={() => handleUpdateStatus(report._id, "reviewing")}
                    disabled={actionLoading === report._id}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === report._id ? "..." : "Mark Reviewing"}
                  </button>
                )}
                {(report.status === "pending" ||
                  report.status === "reviewing") && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(report._id, "resolved")
                      }
                      disabled={actionLoading === report._id}
                      className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === report._id ? "..." : "Resolve"}
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(report._id, "dismissed")
                      }
                      disabled={actionLoading === report._id}
                      className="px-3 py-1.5 text-sm font-medium text-charcoal/60 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === report._id ? "..." : "Dismiss"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <p className="text-charcoal/50 text-center py-8">
            No reports yet.
          </p>
        )}
      </div>
    </div>
  );
}
