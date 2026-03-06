import type { EditableJob, JobStatus } from "./types";

export const DEFAULT_EDITABLE_JOB: EditableJob = {
  id: "",
  title: "",
  slug: "",
  heroImageId: null,
  locationPrefectureId: "",
  salaryText: "",
  benefits: [],
  descriptionRich: {},
  status: "DRAFT",
  isFeatured: false,
  publishAt: null,
  scheduledAt: null,
  updatedAt: null,
};

export const STATUS_LABEL: Record<JobStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  CLOSED: "Closed",
};

export const STATUS_BADGE_VARIANT: Record<
  JobStatus,
  "secondary" | "default" | "outline" | "destructive"
> = {
  DRAFT: "secondary",
  SCHEDULED: "outline",
  PUBLISHED: "default",
  CLOSED: "destructive",
};
