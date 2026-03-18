import { render, screen, act } from "@testing-library/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

// useReducedMotion을 모킹하여 애니메이션 즉시 표시
jest.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

describe("AnimatedNumber", () => {
  it("renders the target value immediately when reduced motion is preferred", () => {
    render(<AnimatedNumber value={1000} />);
    expect(screen.getByText("1,000")).toBeInTheDocument();
  });

  it("applies custom formatter", () => {
    render(
      <AnimatedNumber
        value={100000000}
        formatter={(n) =>
          n >= 100000000
            ? `${(n / 100000000).toFixed(1)}억`
            : n.toLocaleString()
        }
      />,
    );
    expect(screen.getByText("1.0억")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AnimatedNumber value={42} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders 0 when value is 0", () => {
    render(<AnimatedNumber value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
