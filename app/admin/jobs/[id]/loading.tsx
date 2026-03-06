import { JobEditorSkeleton } from "@/components/ui/job-editor-skeleton";

/**
 * Loading component for admin job editor page
 *
 * Displayed while job data is being fetched from the database.
 * Shows a skeleton matching the structure of the job editor form.
 */
export default function Loading() {
  return <JobEditorSkeleton />;
}
