export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}

export interface Opportunity {
  _id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  tags: string[];
  skills: string[];
  responsibilities: string[];
  benefits: string[];
  location: {
    country: string;
    city: string;
    area: string;
    address: string;
    isRemote: boolean;
  };
  images: string[];
  commitmentType: "one-time" | "ongoing" | "flexible";
  duration: string;
  startDate: string;
  endDate: string | null;
  deadline: string;
  spotsAvailable: number;
  spotsTaken: number;
  status: "draft" | "published" | "closed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  opportunityId: string;
  opportunityTitle: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  organizerId: string;
  message: string;
  skills: string[];
  availability: string;
  status: "pending" | "approved" | "rejected" | "withdrawn" | "completed";
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface Organization {
  _id: string;
  userId: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  verified: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalOpportunities: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  completedActivities: number;
  monthlyData: { month: string; applications: number }[];
  statusDistribution: { status: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
}
