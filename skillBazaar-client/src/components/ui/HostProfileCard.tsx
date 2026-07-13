"use client";

import Link from "next/link";

interface HostProfileCardProps {
  hostId: string;
  displayName: string;
  city?: string;
  verificationStatus?: string;
  profileImageUrl?: string;
}

export function HostProfileCard({
  hostId,
  displayName,
  city,
  verificationStatus,
  profileImageUrl,
}: HostProfileCardProps) {
  return (
    <Link
      href={`/hosts/${hostId}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-deep-teal/10 flex items-center justify-center text-deep-teal font-semibold overflow-hidden">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          displayName?.charAt(0) || "H"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-charcoal truncate">{displayName}</p>
          {verificationStatus === "verified" && (
            <svg className="w-4 h-4 text-deep-teal flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        {city && <p className="text-sm text-charcoal/50">{city}</p>}
      </div>
    </Link>
  );
}
