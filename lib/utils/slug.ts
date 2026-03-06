/**
 * Generate a URL-friendly slug from a given title.
 * Converts to lowercase, replaces spaces and special characters with hyphens,
 * removes consecutive hyphens, and trims leading/trailing hyphens.
 *
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug string
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== "string") {
    return "";
  }

  return title
    .trim()
    .toLowerCase()
    .normalize("NFD") // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a number suffix if the slug already exists.
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @param currentSlug - Optional current slug to exclude from duplicate check (for editing)
 * @returns A unique slug with a number suffix if needed
 */
export function makeSlugUnique(
  baseSlug: string,
  existingSlugs: string[],
  currentSlug?: string,
): string {
  if (!baseSlug) {
    return "";
  }

  // If the base slug is the same as the current slug, no need to change it
  if (currentSlug && baseSlug === currentSlug) {
    return baseSlug;
  }

  // If the slug doesn't exist, use it as-is
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Find the next available number suffix
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}
