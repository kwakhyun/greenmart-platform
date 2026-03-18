import { render, screen } from "@testing-library/react";
import { SkipLink } from "@/components/ui/SkipLink";

describe("SkipLink", () => {
  it("renders a link to #main-content", () => {
    render(<SkipLink />);
    const link = screen.getByText("본문으로 건너뛰기");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("has sr-only class by default", () => {
    render(<SkipLink />);
    const link = screen.getByText("본문으로 건너뛰기");
    expect(link.className).toContain("sr-only");
  });
});
