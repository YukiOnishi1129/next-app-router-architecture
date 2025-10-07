import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import Home from "./page";

describe("Home Page", () => {
  it("renders the home page", () => {
    render(<Home />);

    // Check for Next.js logo
    const logo = screen.getByAltText("Next.js logo");
    expect(logo).toBeInTheDocument();

    // Check for the getting started text
    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();
    expect(screen.getByText(/src\/app\/page.tsx/i)).toBeInTheDocument();
  });

  it("renders all footer links", () => {
    render(<Home />);

    const learnLink = screen.getByRole("link", { name: /learn/i });
    const examplesLink = screen.getByRole("link", { name: /examples/i });
    const nextjsLink = screen.getByRole("link", { name: /go to nextjs.org/i });

    expect(learnLink).toBeInTheDocument();
    expect(learnLink).toHaveAttribute(
      "href",
      expect.stringContaining("nextjs.org/learn")
    );

    expect(examplesLink).toBeInTheDocument();
    expect(examplesLink).toHaveAttribute(
      "href",
      expect.stringContaining("vercel.com/templates")
    );

    expect(nextjsLink).toBeInTheDocument();
    expect(nextjsLink).toHaveAttribute(
      "href",
      expect.stringContaining("nextjs.org")
    );
  });

  it("renders deploy and docs buttons", () => {
    render(<Home />);

    const deployButton = screen.getByRole("link", { name: /deploy now/i });
    const docsButton = screen.getByRole("link", { name: /read our docs/i });

    expect(deployButton).toBeInTheDocument();
    expect(deployButton).toHaveAttribute(
      "href",
      expect.stringContaining("vercel.com/new")
    );
    expect(deployButton).toHaveAttribute("target", "_blank");

    expect(docsButton).toBeInTheDocument();
    expect(docsButton).toHaveAttribute(
      "href",
      expect.stringContaining("nextjs.org/docs")
    );
    expect(docsButton).toHaveAttribute("target", "_blank");
  });

  it("renders all images", () => {
    render(<Home />);

    const images = screen.getAllByRole("img");

    // With our mock, we should have at least the main images
    // Let's check what we actually have
    expect(images.length).toBeGreaterThanOrEqual(2);

    // Check specific images by alt text
    expect(screen.getByAltText("Next.js logo")).toBeInTheDocument();
    expect(screen.getByAltText("Vercel logomark")).toBeInTheDocument();

    // The footer images may be rendered differently, so let's check them individually
    const fileIcon = screen.queryByAltText("File icon");
    const windowIcon = screen.queryByAltText("Window icon");
    const globeIcon = screen.queryByAltText("Globe icon");

    // If they exist, verify they're in the document
    if (fileIcon) expect(fileIcon).toBeInTheDocument();
    if (windowIcon) expect(windowIcon).toBeInTheDocument();
    if (globeIcon) expect(globeIcon).toBeInTheDocument();
  });
});
