/**
 * Unit tests for form validation error utilities
 */

import { describe, expect, it } from "vitest";

import {
  getFieldError,
  getInputErrorClasses,
  hasFieldError,
} from "@/lib/validation/form-errors";

describe("Form Error Utilities", () => {
  const mockErrors = {
    name: "Name is required",
    email: "Invalid email address",
  };

  describe("hasFieldError", () => {
    it("should return true when field has an error", () => {
      expect(hasFieldError("name", mockErrors)).toBe(true);
      expect(hasFieldError("email", mockErrors)).toBe(true);
    });

    it("should return false when field has no error", () => {
      expect(hasFieldError("phone", mockErrors)).toBe(false);
      expect(hasFieldError("message", mockErrors)).toBe(false);
    });

    it("should return false for empty errors object", () => {
      expect(hasFieldError("name", {})).toBe(false);
    });
  });

  describe("getFieldError", () => {
    it("should return error message when field has an error", () => {
      expect(getFieldError("name", mockErrors)).toBe("Name is required");
      expect(getFieldError("email", mockErrors)).toBe("Invalid email address");
    });

    it("should return undefined when field has no error", () => {
      expect(getFieldError("phone", mockErrors)).toBeUndefined();
      expect(getFieldError("message", mockErrors)).toBeUndefined();
    });

    it("should return undefined for empty errors object", () => {
      expect(getFieldError("name", {})).toBeUndefined();
    });
  });

  describe("getInputErrorClasses", () => {
    it("should return error classes when field has an error", () => {
      const classes = getInputErrorClasses("name", mockErrors);
      expect(classes).toContain("border-red-300");
      expect(classes).toContain("focus:border-red-500");
      expect(classes).toContain("focus:ring-red-500");
    });

    it("should return empty string when field has no error and no base classes", () => {
      const classes = getInputErrorClasses("phone", mockErrors);
      expect(classes).toBe("");
    });

    it("should return only base classes when field has no error", () => {
      const classes = getInputErrorClasses(
        "phone",
        mockErrors,
        "base-class another-class",
      );
      expect(classes).toBe("base-class another-class");
    });

    it("should combine base classes with error classes when field has an error", () => {
      const classes = getInputErrorClasses(
        "name",
        mockErrors,
        "custom-base-class",
      );
      expect(classes).toContain("custom-base-class");
      expect(classes).toContain("border-red-300");
      expect(classes).toContain("focus:border-red-500");
    });

    it("should return empty string for empty errors object with no base classes", () => {
      const classes = getInputErrorClasses("name", {});
      expect(classes).toBe("");
    });
  });
});
