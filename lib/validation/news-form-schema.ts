import { z } from "zod";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Client-side Zod schema for the News Create/Edit form.
 *
 * Only title, categoryId, and contentHtml are required from the user.
 * Slug and excerpt are auto-generated server-side.
 */
export const newsCreateFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(200, "Title must be at most 200 characters."),

    categoryId: z
      .string()
      .min(1, "Category is required.")
      .regex(UUID_REGEX, "Category must be a valid ID."),

    contentHtml: z.string().min(1, "News content is required."),
  })
  .transform((data) => ({
    title: data.title,
    categoryId: data.categoryId,
    contentRich: { html: data.contentHtml } as Record<string, unknown>,
  }));

export type NewsCreateFormInput = z.input<typeof newsCreateFormSchema>;

export type NewsCreateFormOutput = z.output<typeof newsCreateFormSchema>;

/**
 * Validates news create/edit form data and returns either field errors or
 * the parsed payload ready for the API.
 */
export function validateNewsCreateForm(
  data: NewsCreateFormInput,
):
  | { success: true; data: NewsCreateFormOutput }
  | { success: false; errors: Record<string, string> } {
  const result = newsCreateFormSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in errors)) {
      errors[field] = issue.message;
    }
  }

  return { success: false, errors };
}
