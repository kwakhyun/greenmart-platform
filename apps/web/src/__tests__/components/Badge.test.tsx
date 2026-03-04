import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>판매 중</Badge>);
    expect(screen.getByText("판매 중")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-gray-100", "text-gray-800");
  });

  it("applies success variant styles", () => {
    render(<Badge variant="success">성공</Badge>);
    const badge = screen.getByText("성공");
    expect(badge).toHaveClass("bg-green-100", "text-green-800");
  });

  it("applies danger variant styles", () => {
    render(<Badge variant="danger">위험</Badge>);
    const badge = screen.getByText("위험");
    expect(badge).toHaveClass("bg-red-100", "text-red-800");
  });

  it("supports custom className", () => {
    render(<Badge className="ml-2">커스텀</Badge>);
    const badge = screen.getByText("커스텀");
    expect(badge).toHaveClass("ml-2");
  });
});
