import { render, screen } from "@testing-library/react";
import {
  Skeleton,
  DashboardSkeleton,
  TableSkeleton,
  ProductCardSkeleton,
  ListSkeleton,
} from "@/components/ui/Skeleton";

describe("Skeleton", () => {
  it("renders a single skeleton element", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.className).toContain("animate-shimmer");
  });

  it("renders multiple skeletons with count prop", () => {
    const { container } = render(<Skeleton count={3} />);
    const skeletons = container.querySelectorAll("[aria-hidden='true']");
    expect(skeletons.length).toBe(3);
  });

  it("applies text variant styles", () => {
    const { container } = render(<Skeleton variant="text" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded");
  });

  it("applies circular variant styles", () => {
    const { container } = render(<Skeleton variant="circular" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-full");
  });

  it("applies custom width and height", () => {
    const { container } = render(<Skeleton width="100px" height="50px" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("100px");
    expect(el.style.height).toBe("50px");
  });

  it("applies numeric width and height as px", () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("200px");
    expect(el.style.height).toBe("100px");
  });
});

describe("DashboardSkeleton", () => {
  it("renders with loading status role", () => {
    render(<DashboardSkeleton />);
    const statusElements = screen.getAllByRole("status");
    expect(statusElements.length).toBeGreaterThanOrEqual(1);
  });

  it("has sr-only loading text", () => {
    render(<DashboardSkeleton />);
    expect(
      screen.getByText("대시보드 데이터를 불러오는 중입니다..."),
    ).toBeInTheDocument();
  });
});

describe("TableSkeleton", () => {
  it("renders correct number of rows and columns", () => {
    const { container } = render(<TableSkeleton rows={3} cols={4} />);
    const tbody = container.querySelector("tbody");
    expect(tbody?.querySelectorAll("tr").length).toBe(3);
    const firstRow = tbody?.querySelector("tr");
    expect(firstRow?.querySelectorAll("td").length).toBe(4);
  });

  it("has sr-only loading text", () => {
    render(<TableSkeleton />);
    expect(
      screen.getByText("테이블 데이터를 불러오는 중입니다..."),
    ).toBeInTheDocument();
  });
});

describe("ProductCardSkeleton", () => {
  it("renders correct number of card skeletons", () => {
    render(<ProductCardSkeleton count={3} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.getByText("상품 데이터를 불러오는 중입니다..."),
    ).toBeInTheDocument();
  });
});

describe("ListSkeleton", () => {
  it("renders correct number of list item skeletons", () => {
    render(<ListSkeleton count={5} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.getByText("목록 데이터를 불러오는 중입니다..."),
    ).toBeInTheDocument();
  });
});
