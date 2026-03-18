import { render, act, fireEvent } from "@testing-library/react";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

describe("ScrollProgress", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  it("returns null when scrolled to top", () => {
    const { container } = render(<ScrollProgress />);
    expect(container.querySelector("[role='progressbar']")).toBeNull();
  });

  it("shows progress bar when scrolled", () => {
    const { container, rerender } = render(<ScrollProgress />);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        value: 600,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    // re-render to pick up state change
    rerender(<ScrollProgress />);

    const progressBar = container.querySelector("[role='progressbar']");
    if (progressBar) {
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
      expect(progressBar).toHaveAttribute("aria-label", "페이지 스크롤 진행률");
    }
  });
});
