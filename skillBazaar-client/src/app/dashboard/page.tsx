"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { DashboardSummary } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0d9488", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#10b981"];

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    api.get<DashboardSummary>("/api/dashboard/summary")
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (isPending || loading) {
    return <div className="p-6"><div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}</div></div>;
  }

  if (!summary) return <div className="p-6 text-charcoal/50">Could not load dashboard data.</div>;

  const cards = [
    { label: "Total Opportunities", value: summary.totalOpportunities, color: "text-deep-teal" },
    { label: "Total Applications", value: summary.totalApplications, color: "text-blue-600" },
    { label: "Pending Applications", value: summary.pendingApplications, color: "text-amber-600" },
    { label: "Approved", value: summary.approvedApplications, color: "text-green-600" },
    { label: "Completed", value: summary.completedActivities, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-charcoal/50">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-charcoal mb-4">Monthly Applications</h3>
          {summary.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-charcoal/40 text-sm text-center py-8">No data yet</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-charcoal mb-4">Application Status</h3>
          {summary.statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={summary.statusDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${status}: ${count}`}>
                  {summary.statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-charcoal/40 text-sm text-center py-8">No data yet</p>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-charcoal mb-4">Opportunities by Category</h3>
          {summary.categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.categoryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-charcoal/40 text-sm text-center py-8">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
