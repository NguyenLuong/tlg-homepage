import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PublicHeader } from "@/components/public/public-header";
import {
  getPublicHeaderContent,
  type LocalizedPublicNavigationItem,
} from "@/lib/public-content/navigation-content";

// Mock usePathname/useSearchParams/useRouter for navigation utilities
vi.mock("next/navigation", () => ({
  usePathname: () => "/vi",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockNavigation: LocalizedPublicNavigationItem[] = [
  { key: "home", label: "Trang chủ", href: "/", position: 1 },
  { key: "jobs", label: "Việc làm", href: "/jobs", position: 2 },
  { key: "news", label: "Tin tức", href: "/news", position: 3 },
  { key: "about", label: "Về chúng tôi", href: "/about", position: 4 },
];

const headerContent = getPublicHeaderContent("vi");

describe("PublicHeader - Mobile Navigation", () => {
  it("should open mobile menu when hamburger button is clicked", async () => {
    render(
      <PublicHeader
        locale="vi"
        navigation={mockNavigation}
        content={headerContent}
      />,
    );

    // Find and click hamburger button
    const hamburgerButton = screen.getByRole("button", { name: /open menu/i });
    expect(hamburgerButton).toBeInTheDocument();

    fireEvent.click(hamburgerButton);

    // Mobile menu should be visible
    const mobileNav = screen.getByRole("navigation", {
      name: /mobile navigation/i,
    });
    expect(mobileNav).toBeInTheDocument();

    // All navigation links should be visible within the mobile menu
    expect(
      within(mobileNav).getByRole("link", { name: "Trang chủ" }),
    ).toBeInTheDocument();
    expect(
      within(mobileNav).getByRole("link", { name: "Việc làm" }),
    ).toBeInTheDocument();
    expect(
      within(mobileNav).getByRole("link", { name: "Tin tức" }),
    ).toBeInTheDocument();
  });

  it("should close mobile menu when close button is clicked", async () => {
    render(
      <PublicHeader
        locale="vi"
        navigation={mockNavigation}
        content={headerContent}
      />,
    );

    // Open menu
    const hamburgerButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(hamburgerButton);

    // Verify menu is open
    expect(
      screen.getByRole("navigation", { name: /mobile navigation/i }),
    ).toBeInTheDocument();

    // Close menu
    const closeButton = screen.getByRole("button", { name: /close menu/i });
    fireEvent.click(closeButton);

    // Mobile menu should be removed
    await waitFor(
      () => {
        expect(
          screen.queryByRole("navigation", { name: /mobile navigation/i }),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should close mobile menu when ESC key is pressed", async () => {
    render(
      <PublicHeader
        locale="vi"
        navigation={mockNavigation}
        content={headerContent}
      />,
    );

    // Open menu
    const hamburgerButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(hamburgerButton);

    // Verify menu is open
    expect(
      screen.getByRole("navigation", { name: /mobile navigation/i }),
    ).toBeInTheDocument();

    // Press ESC key on window
    const escEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
    });
    window.dispatchEvent(escEvent);

    // Mobile menu should be removed
    await waitFor(
      () => {
        expect(
          screen.queryByRole("navigation", { name: /mobile navigation/i }),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should close mobile menu when navigation link is clicked", async () => {
    render(
      <PublicHeader
        locale="vi"
        navigation={mockNavigation}
        content={headerContent}
      />,
    );

    // Open menu
    const hamburgerButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(hamburgerButton);

    // Get the mobile navigation container
    const mobileNav = screen.getByRole("navigation", {
      name: /mobile navigation/i,
    });

    // Click a navigation link within the mobile menu
    const jobsLink = within(mobileNav).getByRole("link", { name: "Việc làm" });
    fireEvent.click(jobsLink);

    // Mobile menu should be removed
    await waitFor(() => {
      expect(
        screen.queryByRole("navigation", { name: /mobile navigation/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("should include language switcher in mobile menu", async () => {
    render(
      <PublicHeader
        locale="vi"
        navigation={mockNavigation}
        content={headerContent}
      />,
    );

    // Open menu
    const hamburgerButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(hamburgerButton);

    // Language switcher should be present (two instances: desktop and mobile)
    const languageSwitchers = screen.getAllByRole("switch", {
      name: headerContent.languageSwitcher.ariaLabel,
    });
    expect(languageSwitchers.length).toBeGreaterThanOrEqual(1);
  });

  it("should block body scroll when menu is open", async () => {
    render(
      <PublicHeader
        locale="vi"
        navigation={mockNavigation}
        content={headerContent}
      />,
    );

    // Initial state - body should be scrollable
    const initialOverflow = document.body.style.overflow;

    // Open menu
    const hamburgerButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(hamburgerButton);

    // Body scroll should be blocked
    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });

    // Close menu
    const closeButton = screen.getByRole("button", { name: /close menu/i });
    fireEvent.click(closeButton);

    // Body scroll should be restored
    await waitFor(() => {
      expect(document.body.style.overflow).toBe(initialOverflow);
    });
  });
});
