export type JobApplyOption = {
  title?: string | null;
  link?: string | null;
};

export type JobHighlight = {
  title?: string | null;
  items: string[];
};

export type JobListing = {
  job_id?: string | null;
  htidocid?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  type?: string | null;
  via?: string | null;
  description?: string | null;
  posted_at?: string | null;
  salary?: string | null;
  extensions?: string[];
  detected_extensions?: Record<string, any>;
  apply_options?: JobApplyOption[];
  job_highlights?: JobHighlight[];
  share_link?: string | null;
};

export type JobSearchResponse = {
  query: string;
  location: string;
  page: number;
  employment_type?: string | null;
  role_filters?: string[];
  seniority_filters?: string[];
  jobs: JobListing[];
};

export type JobDetailResponse = {
  job: JobListing;
};

export type SavedJob = {
  job_id: string;
  saved_at: string;
  job: JobListing;
};

export type SavedJobsResponse = {
  jobs: SavedJob[];
};
