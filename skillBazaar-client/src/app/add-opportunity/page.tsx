"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { Category } from "@/types";

export default function AddOpportunityPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", shortDescription: "", fullDescription: "", category: "",
    tags: "", skills: "", responsibilities: "", benefits: "",
    commitmentType: "one-time", duration: "", startDate: "", endDate: "", deadline: "",
    spotsAvailable: "5",
    locationCity: "", locationCountry: "", locationArea: "", locationAddress: "", isRemote: false,
    images: "",
  });

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/api/opportunities", {
        title: form.title,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        category: form.category,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split("\n").filter(Boolean),
        benefits: form.benefits.split("\n").filter(Boolean),
        commitmentType: form.commitmentType,
        duration: form.duration,
        startDate: form.startDate,
        endDate: form.endDate || null,
        deadline: form.deadline,
        spotsAvailable: parseInt(form.spotsAvailable) || 5,
        location: {
          country: form.locationCountry,
          city: form.locationCity,
          area: form.locationArea,
          address: form.locationAddress,
          isRemote: form.isRemote,
        },
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        status: "published",
      });
      router.push("/manage-opportunities");
    } catch (err: any) {
      setError(err.message || "Failed to create opportunity");
    } finally {
      setSaving(false);
    }
  };

  if (isPending) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" /></div>;

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-deep-teal focus:outline-none";

  return (
    <div className="min-h-screen bg-off-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-charcoal mb-6">Add Volunteer Opportunity</h1>
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Short Description *</label>
            <input type="text" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Full Description</label>
            <textarea value={form.fullDescription} onChange={(e) => setForm({ ...form, fullDescription: e.target.value })} rows={6} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Commitment Type</label>
              <select value={form.commitmentType} onChange={(e) => setForm({ ...form, commitmentType: e.target.value })} className={inputCls}>
                <option value="one-time">One-time</option>
                <option value="ongoing">Ongoing</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-charcoal mb-1">Skills (comma separated)</label><input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className={inputCls} placeholder="teaching, communication" /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1">Tags (comma separated)</label><input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="community, education" /></div>
          </div>
          <div><label className="block text-sm font-medium text-charcoal mb-1">Responsibilities (one per line)</label><textarea value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} rows={4} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-charcoal mb-1">Benefits (one per line)</label><textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={3} className={inputCls} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-charcoal mb-1">Duration</label><input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls} placeholder="3 months" /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1">Spots Available</label><input type="number" value={form.spotsAvailable} onChange={(e) => setForm({ ...form, spotsAvailable: e.target.value })} className={inputCls} min="1" /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1">Deadline</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-charcoal mb-1">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1">End Date (optional)</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-charcoal mb-1">City</label><input type="text" value={form.locationCity} onChange={(e) => setForm({ ...form, locationCity: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1">Country</label><input type="text" value={form.locationCountry} onChange={(e) => setForm({ ...form, locationCountry: e.target.value })} className={inputCls} /></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} className="rounded" />
            <label className="text-sm text-charcoal">Remote opportunity</label>
          </div>
          <div><label className="block text-sm font-medium text-charcoal mb-1">Image URLs (one per line)</label><textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3} className={inputCls} placeholder="https://example.com/image.jpg" /></div>
          <button type="submit" disabled={saving} className="w-full py-3 bg-deep-teal text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {saving ? "Creating..." : "Create Opportunity"}
          </button>
        </form>
      </div>
    </div>
  );
}
