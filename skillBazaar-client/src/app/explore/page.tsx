"use client";

import { Suspense, useCallback, useEffect, useReducer } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Category, Experience } from "@/types";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { ExperienceCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
];

interface State {
  experiences: Experience[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: boolean;
}

type Action =
  | { type: "loading" }
  | { type: "success"; payload: { experiences: Experience[]; total: number; totalPages: number } }
  | { type: "error" };

const initialState: State = {
  experiences: [],
  total: 0,
  totalPages: 0,
  loading: true,
  error: false,
};

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...initialState, loading: true };
    case "success":
      return { loading: false, error: false, ...action.payload };
    case "error":
      return { ...initialState, loading: false, error: true };
  }
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";
  const date = searchParams.get("date") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [state, dispatch] = useReducer(reducer, initialState);
  const [categories, setCategories] = useReducer(
    (_prev: Category[], next: Category[]) => next,
    [] as Category[]
  );
  const [availableOnly, setAvailableOnly] = useReducer(
    (_prev: boolean, next: boolean) => next,
    false
  );

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const ac = new AbortController();

    const fetchData = async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (city) params.set("city", city);
      if (category) params.set("category", category);
      if (date) params.set("date", date);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (sort && sort !== "newest") params.set("sort", sort);
      if (page > 1) params.set("page", String(page));
      params.set("limit", "12");
      if (availableOnly) params.set("available", "true");

      dispatch({ type: "loading" });

      try {
        const qs = params.toString();
        const res = await api.get<Experience[] | { data: Experience[]; total: number; page: number; limit: number; totalPages: number }>(
          `/api/experiences${qs ? `?${qs}` : ""}`
        );

        if (!ac.signal.aborted) {
          if (Array.isArray(res)) {
            dispatch({
              type: "success",
              payload: { experiences: res, total: res.length, totalPages: 1 },
            });
          } else {
            dispatch({
              type: "success",
              payload: {
                experiences: res.data,
                total: res.total,
                totalPages: res.totalPages,
              },
            });
          }
        }
      } catch {
        if (!ac.signal.aborted) dispatch({ type: "error" });
      }
    };

    fetchData();

    return () => ac.abort();
  }, [search, city, category, date, maxPrice, sort, page, availableOnly]);

  const updateQuery = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (!("page" in updates)) {
        params.set("page", "1");
      }
      router.push(`/explore?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/explore");
  }, [router]);

  const hasActiveFilters = search || city || category || date || maxPrice || availableOnly;

  return (
    <div className="flex-1 bg-charcoal/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-8 space-y-6 bg-white rounded-xl border border-charcoal/10 p-6">
              <div>
                <h3 className="font-semibold text-charcoal mb-3">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-deep-teal hover:text-deep-teal/80"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => updateQuery({ search: e.target.value })}
                  placeholder="Keyword..."
                  className="w-full px-3 py-2 rounded-lg border border-charcoal/20 bg-white text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => updateQuery({ category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-charcoal/20 bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => updateQuery({ city: e.target.value })}
                  placeholder="Any city..."
                  className="w-full px-3 py-2 rounded-lg border border-charcoal/20 bg-white text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => updateQuery({ date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-charcoal/20 bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => updateQuery({ maxPrice: e.target.value })}
                  placeholder="No limit"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-charcoal/20 bg-white text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-charcoal/20 bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available-only"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded border-charcoal/30 text-deep-teal focus:ring-deep-teal/40"
                />
                <label htmlFor="available-only" className="text-sm text-charcoal">
                  Available Sessions Only
                </label>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {!state.loading && !state.error && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-charcoal/60">
                  {state.total} {state.total === 1 ? "experience" : "experiences"} found
                </p>
              </div>
            )}

            {state.loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ExperienceCardSkeleton key={i} />
                ))}
              </div>
            )}

            {state.error && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-1">Something went wrong</h3>
                <p className="text-sm text-charcoal/60 mb-6">Failed to load experiences. Please try again.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-lg bg-deep-teal text-white text-sm font-medium hover:bg-deep-teal/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!state.loading && !state.error && state.experiences.length === 0 && (
              <EmptyState
                title="No experiences found"
                description="Try adjusting your filters or search for something else"
                actionLabel="Clear Filters"
                actionHref="/explore"
              />
            )}

            {!state.loading && !state.error && state.experiences.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {state.experiences.map((exp) => (
                    <ExperienceCard key={exp._id} experience={exp} />
                  ))}
                </div>

                {state.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => updateQuery({ page: String(page - 1) })}
                      disabled={page <= 1}
                      className="px-4 py-2 rounded-lg border border-charcoal/20 text-sm text-charcoal hover:bg-charcoal/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: state.totalPages }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => updateQuery({ page: String(p) })}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            p === page
                              ? "bg-deep-teal text-white"
                              : "border border-charcoal/20 text-charcoal hover:bg-charcoal/5"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => updateQuery({ page: String(page + 1) })}
                      disabled={page >= state.totalPages}
                      className="px-4 py-2 rounded-lg border border-charcoal/20 text-sm text-charcoal hover:bg-charcoal/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-off-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" /></div>}>
      <ExploreContent />
    </Suspense>
  );
}
