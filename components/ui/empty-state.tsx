import Link from "next/link";
import { Button } from "./button";

export interface EmptyStateProps {
  /**
   * Icon or emoji to display above the title
   * @example <FolderOpen className="h-10 w-10" /> or "📂"
   */
  icon?: React.ReactNode;
  /**
   * Main heading for the empty state
   */
  title: string;
  /**
   * Descriptive text explaining why the list is empty or what to do next
   */
  description: string;
  /**
   * Optional action button configuration
   */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /**
   * Optional additional CSS classes for the container
   */
  className?: string;
}

/**
 * Reusable empty state component for displaying when lists/grids have no content.
 *
 * Provides consistent styling and UX across the application.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="📋"
 *   title="No jobs found"
 *   description="Try adjusting your filters or check back later for new opportunities."
 *   action={{
 *     label: "Clear filters",
 *     onClick: () => resetFilters()
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 text-4xl text-slate-300" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Button asChild className="mt-6">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick} className="mt-6">
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
