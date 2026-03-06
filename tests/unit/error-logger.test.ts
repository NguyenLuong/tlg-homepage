import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  logError,
  logWarning,
  createErrorLogger,
  logErrorBoundary,
  logApiError,
  type ErrorContext,
} from "@/lib/monitoring/error-logger";

describe("error-logger", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleGroupSpy = vi.spyOn(console, "group").mockImplementation(() => {});
    consoleGroupEndSpy = vi
      .spyOn(console, "groupEnd")
      .mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("logError", () => {
    it("should log Error objects to console in development", () => {
      const error = new Error("Test error message");

      logError(error);

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test error message"),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Stack trace:",
        expect.any(String),
      );
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it("should log string errors", () => {
      logError("Simple error string");

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("Simple error string"),
      );
    });

    it("should include context information", () => {
      const error = new Error("Test error");
      const context: ErrorContext = {
        context: "TestComponent",
        userId: "user-123",
        metadata: { action: "save" },
      };

      logError(error, context);

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("[TestComponent]"),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(" User: user-123");
      expect(consoleLogSpy).toHaveBeenCalledWith("Metadata:", {
        action: "save",
      });
    });

    it("should include URL and method when provided", () => {
      const error = new Error("API error");
      const context: ErrorContext = {
        url: "/api/test",
        method: "POST",
      };

      logError(error, context);

      expect(consoleLogSpy).toHaveBeenCalledWith("URL: POST /api/test");
    });

    it("should handle non-Error objects", () => {
      const complexObject = { status: 500, details: "Server error" };

      logError(complexObject);

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("status"),
      );
    });
  });

  describe("logWarning", () => {
    it("should log warnings in development", () => {
      logWarning("Test warning", { context: "TestContext" });

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("WARN"),
      );
      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test warning"),
      );
    });

    it("should include context", () => {
      const context: ErrorContext = {
        context: "WarningContext",
        metadata: { key: "value" },
      };

      logWarning("Warning message", context);

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WarningContext]"),
      );
    });
  });

  describe("createErrorLogger", () => {
    it("should create logger with pre-defined context", () => {
      const logger = createErrorLogger({
        context: "TestComponent",
        userId: "user-456",
      });

      logger.logError(new Error("Test"), { metadata: { action: "delete" } });

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("[TestComponent]"),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(" User: user-456");
      expect(consoleLogSpy).toHaveBeenCalledWith("Metadata:", {
        action: "delete",
      });
    });

    it("should merge additional context", () => {
      const logger = createErrorLogger({ context: "BaseContext" });

      logger.logError(new Error("Test"), {
        userId: "merged-user",
        metadata: { extra: "data" },
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(" User: merged-user");
      expect(consoleLogSpy).toHaveBeenCalledWith("Metadata:", {
        extra: "data",
      });
    });

    it("should create warning logger", () => {
      const logger = createErrorLogger({ context: "WarnContext" });

      logger.logWarning("Test warning");

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WarnContext]"),
      );
    });
  });

  describe("logErrorBoundary", () => {
    it("should log error boundary errors with component stack", () => {
      const error = new Error("React error");
      const errorInfo = {
        componentStack: "\n    at Component\n    at Parent",
      };

      logErrorBoundary(error, errorInfo, { context: "ErrorBoundary" });

      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith("Metadata:", {
        componentStack: expect.stringContaining("at Component"),
      });
    });

    it("should merge existing metadata with component stack", () => {
      const error = new Error("Boundary error");
      const errorInfo = { componentStack: "\n    at TestComponent" };
      const context: ErrorContext = {
        context: "AppBoundary",
        metadata: { errorCode: 500 },
      };

      logErrorBoundary(error, errorInfo, context);

      expect(consoleLogSpy).toHaveBeenCalledWith("Metadata:", {
        errorCode: 500,
        componentStack: expect.stringContaining("TestComponent"),
      });
    });
  });

  describe("logApiError", () => {
    it("should log API errors with request details", () => {
      const error = new Error("API error");
      const request = new Request("https://example.com/api/test", {
        method: "POST",
      });

      logApiError(error, request, { context: "APIRoute" });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "URL: POST https://example.com/api/test",
      );
      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("[APIRoute]"),
      );
    });

    it("should work without request object", () => {
      const error = new Error("API error");

      logApiError(error, undefined, { context: "APIRoute" });

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("API error"),
      );
    });

    it("should include additional metadata", () => {
      const error = new Error("API error");
      const request = new Request("https://example.com/api/test");

      logApiError(error, request, {
        context: "JobsAPI",
        metadata: { jobId: 123 },
      });

      expect(consoleLogSpy).toHaveBeenCalledWith("Metadata:", {
        jobId: 123,
      });
    });
  });

  describe("error message extraction", () => {
    it("should extract message from Error", () => {
      const error = new Error("Error message");

      logError(error);

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error message"),
      );
    });

    it("should handle string errors", () => {
      logError("String error");

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("String error"),
      );
    });

    it("should stringify objects", () => {
      const errorObj = { code: "ERR_001", message: "Custom error" };

      logError(errorObj);

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("ERR_001"),
      );
    });
  });

  describe("environment-specific behavior", () => {
    it("should log structured JSON in production", () => {
      vi.stubEnv("NODE_ENV", "production");

      const error = new Error("Production error");
      logError(error);

      // In production, should use JSON.stringify
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Production error"),
      );

      vi.unstubAllEnvs();
    });
  });

  describe("stack trace handling", () => {
    it("should include stack trace for Error objects", () => {
      const error = new Error("Error with stack");

      logError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Stack trace:",
        expect.stringContaining("Error with stack"),
      );
    });

    it("should not include stack for non-Error objects", () => {
      logError("String error without stack");

      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        "Stack trace:",
        expect.anything(),
      );
    });
  });
});
