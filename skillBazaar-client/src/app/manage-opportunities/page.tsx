"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Opportunity } from "@/types";

export default function ManageOpportunitiesPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    api.get<Opportunity[]>("/api/opportunities/my")
      .then(setOpps)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this opportunity?")) return;
    try {
      await api.del(`/api/opportunities/${id}`);
      setOpps((prev) => prev.filter((o) => o._id !== id));
      showToast("success", "Opportunity deleted");
    } catch (err: any) { showToast("error", err.message); }
  };

  if (isPending || loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" /></div>;

  return (
    <div className="min-h-screen bg-off-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-charcoal">My Opportunities</h1>
          <Link href="/add-opportunity" className="px-4 py-2 bg-deep-teal text-white text-sm font-medium rounded-lg hover:bg-teal-700">Add New</Link>
        </div>
        {opps.length === 0 ? (
          <p className="text-charcoal/50 text-center py-12">No opportunities yet. <Link href="/add-opportunity" className="text-deep-teal hover:underline">Create one</Link></p>
        ) : (
          <div className="space-y-3">
            {opps.map((opp) => (
              <div key={opp._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <Link href={`/opportunities/${opp._id}`} className="font-medium text-charcoal hover:text-deep-teal">{opp.title}</Link>
                  <p className="text-sm text-charcoal/50 mt-0.5">{opp.category} &middot; {opp.spotsTaken}/{opp.spotsAvailable} spots filled</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${opp.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{opp.status}</span>
                  <button onClick={() => handleDelete(opp._id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
