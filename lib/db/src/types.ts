export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  budget?: string | null;
  location?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  budget: number;
  timeline: number;
  propertyType: string;
  message?: string | null;
  classification: "HOT" | "COLD";
  generatedEmail?: string | null;
  createdAt: string;
}

export interface Testimonial {
  id: number;
  clientName: string;
  role: string;
  content: string;
  rating: number;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface DesignShare {
  id: number;
  token: string;
  type: string;
  title: string;
  prompt: string;
  frames: string;
  createdAt: string;
}

export interface ProjectRow {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url: string;
  featured: boolean;
  budget: string | null;
  location: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface LeadRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  budget: number;
  timeline: number;
  property_type: string;
  message: string | null;
  classification: string;
  generated_email: string | null;
  created_at: string;
}

export interface TestimonialRow {
  id: number;
  client_name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url: string | null;
  created_at: string;
}

export interface DesignShareRow {
  id: number;
  token: string;
  type: string;
  title: string;
  prompt: string;
  frames: string;
  created_at: string;
}
