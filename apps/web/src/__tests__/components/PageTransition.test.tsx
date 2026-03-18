import { render, screen } from "@testing-library/react";
import { PageTransition } from "@/components/ui/PageTransition";

// Next.js usePathname mock
let mockPathname = "/";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("PageTransition", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("children을 렌더링한다", () => {
    render(
      <PageTransition>
        <div data-testid="child">콘텐츠</div>
      </PageTransition>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("콘텐츠")).toBeInTheDocument();
  });

  it("트랜지션 wrapper div가 존재한다", () => {
    const { container } = render(
      <PageTransition>
        <p>테스트</p>
      </PageTransition>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("transition-all");
  });

  it("초기 렌더 시 visible 상태이다", () => {
    const { container } = render(
      <PageTransition>
        <p>테스트</p>
      </PageTransition>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("opacity-100");
  });
});
