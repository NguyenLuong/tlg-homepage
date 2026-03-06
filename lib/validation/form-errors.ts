/**
 * Form validation error utilities
 * Provides helpers for displaying field-specific errors, highlighting invalid fields,
 * and scrolling to the first error in a form.
 */

/**
 * Scrolls to the first field with an error in the form.
 * Searches for the first element with a data-error attribute or
 * the first element matching field names in the errors object.
 *
 * @param errors - Record of field names to error messages
 * @param formId - Optional form element ID to scope the search
 */
export function scrollToFirstError(
  errors: Record<string, string>,
  formId?: string,
): void {
  const errorFields = Object.keys(errors);
  if (errorFields.length === 0) return;

  const container = formId ? document.getElementById(formId) : document;
  if (!container) return;

  // Try to find the first field with an error by field name
  for (const fieldName of errorFields) {
    const fieldElement =
      container.querySelector<HTMLElement>(`[name="${fieldName}"]`) ||
      container.querySelector<HTMLElement>(`#${fieldName}`);

    if (fieldElement) {
      // Scroll to the element with some offset for better UX
      const yOffset = -100; // Offset to show above the field
      const elementPosition = fieldElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY + yOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Focus the field after scrolling
      setTimeout(() => {
        fieldElement.focus();
      }, 300);

      return;
    }
  }
}

/**
 * Returns CSS classes for an input field based on its error state.
 * Adds red border and focus ring for fields with errors.
 *
 * @param fieldName - Name of the field
 * @param errors - Record of field names to error messages
 * @param baseClasses - Optional base CSS classes to include
 * @returns Combined CSS class string
 */
export function getInputErrorClasses(
  fieldName: string,
  errors: Record<string, string>,
  baseClasses = "",
): string {
  const hasError = fieldName in errors;

  if (!hasError) {
    return baseClasses;
  }

  const errorClasses = "border-red-300 focus:border-red-500 focus:ring-red-500";

  return baseClasses ? `${baseClasses} ${errorClasses}` : errorClasses;
}

/**
 * Returns whether a specific field has an error.
 *
 * @param fieldName - Name of the field to check
 * @param errors - Record of field names to error messages
 * @returns True if the field has an error
 */
export function hasFieldError(
  fieldName: string,
  errors: Record<string, string>,
): boolean {
  return fieldName in errors && errors[fieldName].length > 0;
}

/**
 * Gets the error message for a specific field.
 *
 * @param fieldName - Name of the field
 * @param errors - Record of field names to error messages
 * @returns Error message or undefined if no error
 */
export function getFieldError(
  fieldName: string,
  errors: Record<string, string>,
): string | undefined {
  return errors[fieldName];
}

/**
 * Type-safe field error display component props.
 * Use this type when creating error message components.
 */
export type FieldErrorProps = {
  fieldName: string;
  errors: Record<string, string>;
  className?: string;
};
