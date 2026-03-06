import { NewsEditorSkeleton } from "@/components/ui/news-editor-skeleton";

/**
 * Loading component for admin news editor page
 *
 * Displayed while news data is being fetched from the database.
 * Shows a skeleton matching the structure of the news editor form.
 */
export default function Loading() {
  return <NewsEditorSkeleton />;
}
