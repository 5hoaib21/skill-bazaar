"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Application } from "@/types";

export default function ReceivedApplicationsPage() {
  const { data: session, isPending } = authClient.useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    api.get<Application[]>(`/api/applications/received?${params}`)
      .then(setApps)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, filter]);

  const handleAction = async (id: string, action: "approve" | "reject" | "complete") => {
    if (!confirm(`${action} this application?`)) return;
    try {
      await api.patch(`/api/applications/${id}/${action}`);
      setApps((prev) => prev.map((a) => {
        if (a._id !== id) return a;
        const newStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "completed";
        return { ...a, status: newStatus as any };
      }));
    } catch (err: any) { showToast("error", err.message); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "completed": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (isPending || loading) return <div className="p-6"><div className="animate-pulse space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}</div></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-charcoal">Received Applications</h1>
      <div className="flex gap-2">
        {["", "pending", "approved", "rejected", "completed"].map((f) => (
          <button key={f} onClick={() => { setFilter(f); setLoading(true); }} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f ? "bg-deep-teal text-white" : "bg-white border border-gray-200 text-charcoal hover:bg-gray-50"}`}>
            {f || "All"}
          </button>
        ))}
      </div>
      {apps.length === 0 ? (
        <p className="text-charcoal/50 py-8">No applications found.</p>
      ) : (
        apps.map((app) => (
          <div key={app._id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-charcoal">{app.volunteerName}</p>
                <p className="text-sm text-charcoal/50">{app.volunteerEmail}</p>
                <p className="text-sm text-charcoal/70 mt-1">Applied to: <span className="font-medium">{app.opportunityTitle}</span></p>
                <p className="text-sm text-charcoal/50 mt-0.5">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(app.status)}`}>{app.status}</span>
            </div>
            {app.message && <p className="text-sm text-charcoal/70 mt-2 italic">&ldquo;{app.message}&rdquo;</p>}
            {app.skills?.length > 0 && <div className="flex gap-1.5 mt-2">{app.skills.map((s) => <span key={s} className="px-2 py-0.5 bg-gray-100 text-charcoal/60 text-xs rounded-full">{s}</span>)}</div>}
            {app.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleAction(app._id, "approve")} className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">Approve</button>
                <button onClick={() => handleAction(app._id, "reject")} className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">Reject</button>
              </div>
            )}
            {app.status === "approved" && (
              <button onClick={() => handleAction(app._id, "complete")} className="mt-3 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">Mark Completed</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
