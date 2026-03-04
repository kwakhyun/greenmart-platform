import { render, screen } from "@testing-library/react";
import StatCard from "@/components/dashboard/StatCard";
import { DollarSign } from "lucide-react";

describe("StatCard", () => {
  const defaultProps = {
    title: "오늘 매출",
    value: "₩1,284,000",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    iconColor: "bg-green-100 text-green-600",
  };

  it("renders title and value", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText("오늘 매출")).toBeInTheDocument();
    expect(screen.getByText("₩1,284,000")).toBeInTheDocument();
  });

  it("renders change with correct color for positive", () => {
    render(<StatCard {...defaultProps} />);
    const change = screen.getByText("+12.5%");
    expect(change).toHaveClass("text-green-600");
  });

  it("renders change with correct color for negative", () => {
    render(<StatCard {...defaultProps} change="-3.2%" changeType="negative" />);
    const change = screen.getByText("-3.2%");
    expect(change).toHaveClass("text-red-600");
  });

  it("renders change with correct color for neutral", () => {
    render(<StatCard {...defaultProps} change="0.0%" changeType="neutral" />);
    const change = screen.getByText("0.0%");
    expect(change).toHaveClass("text-gray-500");
  });
});
