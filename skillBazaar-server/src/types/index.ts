export interface Opportunity {
  _id?: any;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  _id?: any;
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
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id?: any;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface Organization {
  _id?: any;
  userId: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  verified: boolean;
  createdAt: Date;
}

export interface ContactMessage {
  _id?: any;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}
