import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import JobEditorForm from "@/app/admin/jobs/[id]/job-editor-form";

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

describe("Admin jobs create form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a new job and redirects to the editor detail page", async () => {
    const createdId = "22222222-2222-4222-8222-222222222222";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: createdId,
            status: "DRAFT",
            publishAt: null,
            scheduledAt: null,
            updatedAt: "2026-02-11T09:30:00.000Z",
          },
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <JobEditorForm
          mode="create"
          job={{
            id: "",
            title: "",
            slug: "",
            heroImageId: null,
            locationPrefectureId: "77777777-7777-4777-8777-777777777777",
            salaryText: "",
            benefits: [],
            descriptionRich: {},
            status: "DRAFT",
            publishAt: null,
            scheduledAt: null,
            updatedAt: null,
          }}
          prefectures={[
            {
              id: "77777777-7777-4777-8777-777777777777",
              nameJP: "Tokyo",
              nameVN: "Tokyo",
              code: "tokyo",
            },
          ]}
          availableAssets={[]}
        />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Job title"), {
      target: { value: "Senior Fullstack Engineer" },
    });
    fireEvent.change(screen.getByPlaceholderText("Monthly salary range"), {
      target: { value: "40 - 55 trieu" },
    });
    fireEvent.change(screen.getByLabelText("Job Description (HTML)"), {
      target: { value: "<p>Build modern web products</p>" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Job" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(requestUrl).toBe("/api/admin/jobs");
    expect(requestInit.method).toBe("POST");
    const requestPayload = JSON.parse(
      (requestInit.body as string) ?? "{}",
    ) as Record<string, unknown>;
    expect(requestPayload).toEqual(
      expect.objectContaining({
        title: "Senior Fullstack Engineer",
        slug: "senior-fullstack-engineer",
        salaryText: "40 - 55 trieu",
        descriptionRich: {
          html: "<p>Build modern web products</p>",
        },
        heroImageId: null,
      }),
    );

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith(`/admin/jobs/${createdId}`);
      expect(routerMock.refresh).toHaveBeenCalledTimes(1);
    });
  });
});
