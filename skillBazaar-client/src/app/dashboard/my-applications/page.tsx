"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Application } from "@/types";

export default function MyApplicationsPage() {
  const { data: session, isPending } = authClient.useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    api.get<Application[]>("/api/applications/my")
      .then(setApps)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw this application?")) return;
    try {
      await api.patch(`/api/applications/${id}/withdraw`);
      setApps((prev) => prev.map((a) => a._id === id ? { ...a, status: "withdrawn" as const } : a));
      showToast("success", "Application withdrawn");
    } catch (err: any) { showToast("error", err.message); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "withdrawn": return "bg-gray-100 text-gray-600";
      case "completed": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (isPending || loading) return <div className="p-6"><div className="animate-pulse space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}</div></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-charcoal">My Applications</h1>
      {apps.length === 0 ? (
        <p className="text-charcoal/50 py-8">No applications yet. <Link href="/opportunities" className="text-deep-teal hover:underline">Browse opportunities</Link></p>
      ) : (
        apps.map((app) => (
          <div key={app._id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/opportunities/${app.opportunityId}`} className="font-medium text-charcoal hover:text-deep-teal">{app.opportunityTitle}</Link>
                <p className="text-sm text-charcoal/50 mt-0.5">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(app.status)}`}>{app.status}</span>
            </div>
            {app.message && <p className="text-sm text-charcoal/70 mt-2">{app.message}</p>}
            {["pending", "approved"].includes(app.status) && (
              <button onClick={() => handleWithdraw(app._id)} className="mt-3 text-sm text-red-500 hover:text-red-700">Withdraw</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
