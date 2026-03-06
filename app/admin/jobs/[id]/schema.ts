import { z } from "zod";

export const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  locationPrefectureId: z.string().min(1, "Prefecture is required."),
  salaryText: z.string().min(1, "Salary is required."),
  jobDescriptionHtml: z.string().min(1, "Job Description is required."),
});
