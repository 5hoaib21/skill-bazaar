"use client";

import Link from "next/link";
import type { Experience } from "@/types";

interface ExperienceCardProps {
  experience: Experience;
  hostName?: string;
}

export function ExperienceCard({ experience, hostName }: ExperienceCardProps) {
  const coverImage = experience.images?.[0];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? "text-warm-amber" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  const categoryName =
    typeof experience.category === "object"
      ? (experience.category as { name: string }).name
      : experience.category;

  return (
    <Link href={`/experiences/${experience._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-gray-200">
          {coverImage ? (
            <img
              src={coverImage}
              alt={experience.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <span className="absolute top-2 left-2 bg-deep-teal text-white text-xs font-medium px-2 py-1 rounded">
            {categoryName}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-charcoal group-hover:text-deep-teal transition-colors truncate">
            {experience.title}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {experience.location.city}
            {experience.location.area && `, ${experience.location.area}`}
          </p>

          {hostName && (
            <p className="text-sm text-gray-500 mt-1">
              Hosted by {hostName}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-deep-teal font-bold text-lg">
              {formatPrice(experience.pricePerParticipant, experience.currency)}
            </span>
            <span className="text-xs text-gray-400">/ person</span>
          </div>

          <div className="flex items-center gap-1 mt-2">
            {renderStars(experience.ratingSummary?.average ?? 0)}
            <span className="text-sm text-gray-500 ml-1">
              {experience.ratingSummary?.average?.toFixed(1) ?? "0.0"}
            </span>
            <span className="text-sm text-gray-400 ml-1">
              ({experience.ratingSummary?.count ?? 0})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
