import { render, screen } from "@testing-library/react";
import { TablePageSkeleton } from "@/components/ui/TablePageSkeleton";
import { DetailPageSkeleton } from "@/components/ui/DetailPageSkeleton";

describe("TablePageSkeleton", () => {
  it("aria-label을 가진 status 영역이 있다", () => {
    render(<TablePageSkeleton />);
    expect(screen.getByLabelText("페이지 로딩 중")).toBeInTheDocument();
  });

  it("sr-only 텍스트가 있다", () => {
    render(<TablePageSkeleton />);
    expect(
      screen.getByText("페이지 데이터를 불러오는 중입니다..."),
    ).toBeInTheDocument();
  });

  it("커스텀 rows/cols를 받을 수 있다", () => {
    const { container } = render(
      <TablePageSkeleton rows={3} cols={3} filterCount={2} />,
    );
    // 테이블이 렌더링됨
    expect(container.querySelector("table")).toBeInTheDocument();
  });
});

describe("DetailPageSkeleton", () => {
  it("role=status와 aria-label을 가진다", () => {
    render(<DetailPageSkeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("상세 정보 로딩 중")).toBeInTheDocument();
  });

  it("sr-only 텍스트가 있다", () => {
    render(<DetailPageSkeleton />);
    expect(
      screen.getByText("상세 데이터를 불러오는 중입니다..."),
    ).toBeInTheDocument();
  });

  it("이미지 placeholder와 정보 영역이 있다", () => {
    const { container } = render(<DetailPageSkeleton />);
    // before: pseudo-element로 shimmer가 적용되므로 inline class로 확인
    const shimmerElements = container.querySelectorAll("[class*='shimmer']");
    expect(shimmerElements.length).toBeGreaterThan(0);
  });
});
