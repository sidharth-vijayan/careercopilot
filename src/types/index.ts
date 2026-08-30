export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected" | "saved";

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  matchScore?: number;
  appliedAt: string; // ISO date string
  notes?: string;
  jobDescription?: string;
}
