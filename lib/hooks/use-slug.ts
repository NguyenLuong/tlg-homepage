import { useCallback, useState } from "react";
import { api } from "@/lib/http/api-client";
import { useDebouncedEffect } from "@/lib/utils/debounce";
import { generateSlug } from "@/lib/utils/slug";

type UseSlugOptions = {
  initialSlug: string;
  entityType: "jobs" | "news";
  entityId?: string;
};

/**
 * Hook for managing slug generation with auto-sync and manual override.
 * Provides real-time slug preview, manual override detection, and regeneration.
 */
export function useSlug({ initialSlug, entityType, entityId }: UseSlugOptions) {
  const [slug, setSlug] = useState(initialSlug);
  const [isManual, setIsManual] = useState(Boolean(initialSlug));

  /**
   * Update slug manually (breaks auto-sync)
   */
  const updateSlug = useCallback((value: string) => {
    setSlug(value);
    setIsManual(true);
  }, []);

  /**
   * Generate slug in real-time from title (local only, no API call)
   */
  const syncSlugFromTitle = useCallback(
    (title: string) => {
      if (!isManual && title.trim()) {
        const generated = generateSlug(title);
        if (generated && generated !== slug) {
          setSlug(generated);
        }
      }
    },
    [isManual, slug],
  );

  /**
   * Regenerate slug from API (validates uniqueness)
   */
  const regenerate = useCallback(
    async (title: string) => {
      if (!title.trim()) {
        return;
      }

      try {
        const result = await api.post<{ slug: string }>(
          `/api/admin/${entityType}/validate-slug`,
          {
            title,
            currentId: entityId,
          },
        );

        setSlug(result.slug);
        setIsManual(false);
      } catch (error) {
        console.error("Failed to generate slug:", error);
      }
    },
    [entityType, entityId],
  );

  return {
    slug,
    isManual,
    updateSlug,
    syncSlugFromTitle,
    regenerate,
  };
}

/**
 * Hook that combines useSlug with debounced auto-sync from title changes
 */
export function useAutoSlug(
  title: string,
  options: UseSlugOptions,
  debounceMs = 300,
) {
  const slugState = useSlug(options);

  // Auto-sync slug when title changes (debounced)
  useDebouncedEffect(
    () => {
      slugState.syncSlugFromTitle(title);
    },
    title,
    debounceMs,
  );

  return slugState;
}
