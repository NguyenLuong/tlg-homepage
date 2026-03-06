import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "@/components/ui/empty-state";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe("EmptyState Component", () => {
  it("renders with title and description", () => {
    render(
      <EmptyState
        title="No results found"
        description="Try adjusting your search criteria"
      />,
    );

    expect(screen.getByText("No results found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search criteria"),
    ).toBeInTheDocument();
  });

  it("renders with icon when provided", () => {
    render(
      <EmptyState
        icon="📋"
        title="Empty list"
        description="Nothing to show yet"
      />,
    );

    expect(screen.getByText("📋")).toBeInTheDocument();
  });

  it("renders with component icon when provided", () => {
    const TestIcon = () => <svg data-testid="test-icon">Icon</svg>;

    render(
      <EmptyState
        icon={<TestIcon />}
        title="Empty list"
        description="Nothing to show yet"
      />,
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders action button with href", () => {
    render(
      <EmptyState
        title="No jobs"
        description="No jobs available right now"
        action={{
          label: "Browse all jobs",
          href: "/jobs",
        }}
      />,
    );

    const link = screen.getByRole("link", { name: "Browse all jobs" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/jobs");
  });

  it("renders action button with onClick", () => {
    const handleClick = vi.fn();

    render(
      <EmptyState
        title="No results"
        description="Try clearing your filters"
        action={{
          label: "Clear filters",
          onClick: handleClick,
        }}
      />,
    );

    const button = screen.getByRole("button", { name: "Clear filters" });
    expect(button).toBeInTheDocument();

    button.click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not render action when not provided", () => {
    render(
      <EmptyState title="Empty state" description="No action available" />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState
        title="Test"
        description="Test description"
        className="custom-class"
      />,
    );

    const emptyStateDiv = container.firstChild as HTMLElement;
    expect(emptyStateDiv).toHaveClass("custom-class");
  });

  it("has accessible aria-hidden on icon", () => {
    const { container } = render(
      <EmptyState icon="📋" title="Empty" description="Nothing here" />,
    );

    const iconDiv = container.querySelector('[aria-hidden="true"]');
    expect(iconDiv).toBeInTheDocument();
    expect(iconDiv).toHaveTextContent("📋");
  });

  it("renders without icon gracefully", () => {
    render(<EmptyState title="No icon" description="This has no icon" />);

    const iconDiv = screen.queryByLabelText(/icon/i);
    expect(iconDiv).not.toBeInTheDocument();
  });
});

describe("EmptyState Component - Localization", () => {
  it("renders Vietnamese empty state", () => {
    render(
      <EmptyState
        icon="📋"
        title="Không tìm thấy công việc"
        description="Hãy thử điều chỉnh bộ lọc hoặc quay lại sau."
        action={{
          label: "Xóa bộ lọc",
          onClick: vi.fn(),
        }}
      />,
    );

    expect(screen.getByText("Không tìm thấy công việc")).toBeInTheDocument();
    expect(
      screen.getByText("Hãy thử điều chỉnh bộ lọc hoặc quay lại sau."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Xóa bộ lọc" }),
    ).toBeInTheDocument();
  });

  it("renders Japanese empty state", () => {
    render(
      <EmptyState
        icon="📋"
        title="求人が見つかりませんでした"
        description="フィルターを調整するか、後でもう一度確認してください。"
        action={{
          label: "フィルターをクリア",
          onClick: vi.fn(),
        }}
      />,
    );

    expect(screen.getByText("求人が見つかりませんでした")).toBeInTheDocument();
    expect(
      screen.getByText(
        "フィルターを調整するか、後でもう一度確認してください。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "フィルターをクリア" }),
    ).toBeInTheDocument();
  });
});
