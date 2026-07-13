"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { EmptyState } from "@/components/ui/EmptyState";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const { data: session, isPending } = authClient.useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const data = await api.get<Category[]>("/api/categories");
        setCategories(data);
      } catch (err: any) {
        setError(err.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await api.post<Category>("/api/categories", form);
      setCategories([...categories, result]);
      setForm({ name: "", slug: "", description: "" });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create category");
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-charcoal">Categories</h1>
        <div className="flex gap-4">
          <Link href="/admin" className="text-sm font-medium text-deep-teal hover:text-deep-teal/80">
            &larr; Back to Admin
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm font-medium bg-deep-teal text-white rounded-lg hover:bg-deep-teal/90"
          >
            {showForm ? "Cancel" : "Add Category"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40"
                placeholder="auto-generated-from-name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-teal/40"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-deep-teal text-white font-medium rounded-lg hover:bg-deep-teal/90 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Category"}
          </button>
        </form>
      )}

      {categories.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-charcoal">{cat.name}</td>
                  <td className="px-6 py-4 text-charcoal/70 font-mono text-sm">{cat.slug}</td>
                  <td className="px-6 py-4 text-charcoal/70">{cat.description || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No categories" description="Create your first category to get started." />
      )}
    </div>
  );
}
