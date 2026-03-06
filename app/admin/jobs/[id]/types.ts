import type { JobDetailResponse, JobStatus } from "@/lib/queries/jobs";

export type { JobDetailResponse, JobStatus };

export type EditableJob = {
  id: string;
  title: string;
  slug: string;
  heroImageId: string | null;
  locationPrefectureId: string;
  salaryText: string;
  benefits: string[];
  descriptionRich: Record<string, unknown>;
  status: JobStatus;
  isFeatured: boolean;
  publishAt: string | null;
  scheduledAt?: string | null;
  updatedAt: string | null;
};

export type PrefectureOption = {
  id: string;
  nameJP: string | null;
  nameVN: string;
  code: string;
};

export type FormState = {
  title: string;
  heroImageId: string;
  locationPrefectureId: string;
  salaryText: string;
  benefitsRaw: string;
  jobDescriptionHtml: string;
};

export type JobMetadata = {
  status: JobStatus;
  publishAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
};

export type JobEditorCreateProps = {
  mode: "create";
  job?: Partial<EditableJob>;
  prefectures: PrefectureOption[];
  availableAssets: import("@/components/admin/media-picker").MediaPickerAsset[];
};

export type JobEditorEditProps = {
  mode?: "edit";
  jobId: string;
  initialData: JobDetailResponse;
};

export type JobEditorFormProps = JobEditorCreateProps | JobEditorEditProps;
