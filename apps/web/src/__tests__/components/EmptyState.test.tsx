import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="데이터가 없습니다" />);
    expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState title="비어 있음" description="검색어를 변경해보세요." />,
    );
    expect(screen.getByText("검색어를 변경해보세요.")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState title="비어 있음" action={<button>다시 시도</button>} />,
    );
    expect(screen.getByText("다시 시도")).toBeInTheDocument();
  });

  it("accepts custom icon", () => {
    render(<EmptyState title="검색 결과 없음" icon={Search} />);
    expect(screen.getByText("검색 결과 없음")).toBeInTheDocument();
  });
});
