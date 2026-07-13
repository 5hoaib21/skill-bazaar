"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { EmptyState } from "@/components/ui/EmptyState";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  banned?: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, isPending } = authClient.useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (filter) params.set("status", filter);
        const result = await api.get<{ data: User[]; meta: { totalPages: number } }>(
          `/api/admin/users?${params}`
        );
        setUsers(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, [session, filter, page]);

  const handleSuspend = async (userId: string, suspend: boolean) => {
    try {
      await api.patch(`/api/admin/users/${userId}/status`, {
        status: suspend ? "suspended" : "active",
      });
      setUsers(users.map((u) =>
        u._id === userId ? { ...u, banned: suspend } : u
      ));
    } catch (err: any) {
      setError(err.message || "Failed to update user");
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Users</h1>
        <Link href="/admin" className="text-sm font-medium text-deep-teal hover:text-deep-teal/80">
          &larr; Back to Admin
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {["", "active", "suspended"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? "bg-deep-teal text-white"
                : "bg-white border border-gray-200 text-charcoal hover:bg-gray-50"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {users.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-charcoal/60 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-charcoal">{user.name}</td>
                  <td className="px-6 py-4 text-charcoal/70">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.banned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {user.banned ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSuspend(user._id, !user.banned)}
                      className={`text-sm font-medium ${
                        user.banned ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"
                      }`}
                    >
                      {user.banned ? "Activate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No users found" description="No users match your filter." />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-charcoal/60">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
