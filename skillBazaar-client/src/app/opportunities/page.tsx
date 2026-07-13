"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Opportunity, Category } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const spotsLeft = opp.spotsAvailable - opp.spotsTaken;
  return (
    <Link href={`/opportunities/${opp._id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-deep-teal/30 transition-all flex flex-col">
      <div className="relative aspect-[16/10] bg-gray-100">
        {opp.images?.[0] ? (
          <img src={opp.images[0]} alt={opp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal/30">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 text-xs font-medium text-charcoal rounded-full backdrop-blur-sm">{opp.category}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-charcoal group-hover:text-deep-teal transition-colors line-clamp-1">{opp.title}</h3>
        <p className="text-sm text-charcoal/60 mt-1 line-clamp-2">{opp.shortDescription}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opp.skills?.slice(0, 3).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-gray-100 text-charcoal/60 text-xs rounded-full">{s}</span>
          ))}
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-charcoal/50">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            {opp.location?.isRemote ? "Remote" : opp.location?.city || "TBD"}
          </span>
          <span className={spotsLeft <= 3 ? "text-red-500 font-medium" : "text-deep-teal font-medium"}>
            {spotsLeft} spots left
          </span>
        </div>
      </div>
    </Link>
  );
}

function OpportunitySkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const commitmentType = searchParams.get("commitmentType") || "";
  const sortBy = searchParams.get("sortBy") || "";

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: "12" });
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (commitmentType) params.set("commitmentType", commitmentType);
        if (sortBy) params.set("sortBy", sortBy);

        const result = await api.get<any>(`/api/opportunities?${params}`);
        setOpportunities(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    })();
  }, [page, search, category, commitmentType, sortBy]);

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Volunteer Opportunities</h1>
          <p className="text-charcoal/60 mt-1">Find meaningful ways to contribute to your community</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/opportunities" className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!category ? "bg-deep-teal text-white" : "bg-white border border-gray-200 text-charcoal hover:bg-gray-50"}`}>
            All
          </Link>
          {categories.map((cat) => (
            <Link key={cat._id} href={`/opportunities?category=${cat.slug}`} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${category === cat.slug ? "bg-deep-teal text-white" : "bg-white border border-gray-200 text-charcoal hover:bg-gray-50"}`}>
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <OpportunitySkeleton key={i} />)}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState title="No opportunities found" description="Try adjusting your filters or check back later." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {opportunities.map((opp) => <OpportunityCard key={opp._id} opp={opp} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50">
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-charcoal/60">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-off-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" /></div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
