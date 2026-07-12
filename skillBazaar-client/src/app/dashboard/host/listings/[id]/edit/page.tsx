"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Category, Experience } from "@/types";

export default function EditExperiencePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    category: "",
    tags: "",
    durationMinutes: 60,
    pricePerParticipant: 0,
    currency: "USD",
    defaultCapacity: 10,
    minimumAge: 0,
    includedItems: "",
    participantRequirements: "",
    safetyNotes: "",
    country: "",
    city: "",
    area: "",
    address: "",
    latitude: 0,
    longitude: 0,
    images: "",
  });

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const [exp, cats] = await Promise.all([
          api.get<Experience>(`/api/experiences/${params.id}`),
          api.get<Category[]>("/api/categories").catch(() => [] as Category[]),
        ]);
        setCategories(cats);
        setForm({
          title: exp.title,
          shortDescription: exp.shortDescription,
          fullDescription: exp.fullDescription,
          category:
            typeof exp.category === "object"
              ? (exp.category as any)._id
              : exp.category,
          tags: exp.tags.join(", "),
          durationMinutes: exp.durationMinutes,
          pricePerParticipant: exp.pricePerParticipant,
          currency: exp.currency,
          defaultCapacity: exp.defaultCapacity,
          minimumAge: exp.minimumAge,
          includedItems: exp.includedItems.join("\n"),
          participantRequirements: exp.participantRequirements.join("\n"),
          safetyNotes: exp.safetyNotes.join("\n"),
          country: exp.location.country,
          city: exp.location.city,
          area: exp.location.area,
          address: exp.location.address,
          latitude: exp.location.latitude,
          longitude: exp.location.longitude,
          images: exp.images.join("\n"),
        });
      } catch (err: any) {
        setError(err.message || "Failed to load experience");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "durationMinutes" ||
        name === "pricePerParticipant" ||
        name === "defaultCapacity" ||
        name === "minimumAge" ||
        name === "latitude" ||
        name === "longitude"
          ? Number(value)
          : value,
    }));
  };

  const handleSave = async (status: "draft" | "published") => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        durationMinutes: form.durationMinutes,
        pricePerParticipant: form.pricePerParticipant,
        currency: form.currency,
        defaultCapacity: form.defaultCapacity,
        minimumAge: form.minimumAge,
        includedItems: form.includedItems.split("\n").filter(Boolean),
        participantRequirements: form.participantRequirements.split("\n").filter(Boolean),
        safetyNotes: form.safetyNotes.split("\n").filter(Boolean),
        location: {
          country: form.country,
          city: form.city,
          area: form.area,
          address: form.address,
          latitude: form.latitude,
          longitude: form.longitude,
        },
        images: form.images.split("\n").filter(Boolean),
        status,
      };
      await api.patch(`/api/experiences/${params.id}`, payload);
      router.push("/dashboard/host/listings");
    } catch (err: any) {
      setError(err.message || "Failed to save experience");
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Edit Experience</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-1">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-1">
              Full Description
            </label>
            <textarea
              name="fullDescription"
              value={form.fullDescription}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              min={1}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Price per participant
            </label>
            <input
              type="number"
              name="pricePerParticipant"
              value={form.pricePerParticipant}
              onChange={handleChange}
              min={0}
              step={0.01}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Currency
            </label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Default Capacity
            </label>
            <input
              type="number"
              name="defaultCapacity"
              value={form.defaultCapacity}
              onChange={handleChange}
              min={1}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Minimum Age
            </label>
            <input
              type="number"
              name="minimumAge"
              value={form.minimumAge}
              onChange={handleChange}
              min={0}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-charcoal mb-3">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Area
              </label>
              <input
                type="text"
                name="area"
                value={form.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                step={0.000001}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                step={0.000001}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-charcoal mb-3">
            Details (one per line)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Included Items
              </label>
              <textarea
                name="includedItems"
                value={form.includedItems}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                What to Bring
              </label>
              <textarea
                name="participantRequirements"
                value={form.participantRequirements}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Safety Notes
              </label>
              <textarea
                name="safetyNotes"
                value={form.safetyNotes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Image URLs (one per line)
              </label>
              <textarea
                name="images"
                value={form.images}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-6 py-2 border border-deep-teal text-deep-teal font-medium rounded-lg hover:bg-deep-teal/5 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-6 py-2 bg-deep-teal text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
