"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { HostProfile, Experience } from "@/types";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function HostProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const hostProfile = await api.get<HostProfile>(`/api/hosts/${params.id}`);
        setProfile(hostProfile);

        const allExperiences = await api.get<Experience[]>("/api/experiences");
        const hostExperiences = allExperiences.filter(
          (exp) => exp.hostId === params.id || exp.hostId === hostProfile.userId
        );
        setExperiences(hostExperiences);
      } catch (err: any) {
        setError(err.message || "Failed to load host profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-off-white gap-4">
        <p className="text-red-500">{error || "Host not found"}</p>
        <Link href="/" className="text-deep-teal hover:underline">
          Back to explore
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 rounded-full bg-deep-teal/10 flex items-center justify-center text-deep-teal text-3xl font-bold">
              {profile.displayName?.charAt(0) || "H"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-charcoal">
                  {profile.displayName}
                </h1>
                {profile.verificationStatus === "verified" && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Verified Host
                  </span>
                )}
              </div>
              {profile.city && (
                <p className="text-charcoal/60 mb-4">{profile.city}</p>
              )}
              {profile.bio && (
                <p className="text-charcoal/70 mb-4">{profile.bio}</p>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-sm bg-deep-teal/10 text-deep-teal rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              {profile.languages && profile.languages.length > 0 && (
                <p className="text-sm text-charcoal/50">
                  Languages: {profile.languages.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-charcoal mb-6">
            Experiences by {profile.displayName}
          </h2>
          {experiences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No experiences yet"
              description="This host hasn't published any experiences yet."
            />
          )}
        </div>
      </div>
    </div>
  );
}
