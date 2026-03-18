import { render, screen } from "@testing-library/react";
import { LazySection } from "@/components/ui/LazySection";

// useIntersectionObserver mock
let mockIsIntersecting = false;

jest.mock("@/hooks", () => ({
  useIntersectionObserver: () => ({
    ref: { current: null },
    isIntersecting: mockIsIntersecting,
  }),
}));

describe("LazySection", () => {
  beforeEach(() => {
    mockIsIntersecting = false;
  });

  it("뷰포트 밖에서는 스켈레톤 placeholder를 표시한다", () => {
    const { container } = render(
      <LazySection>
        <div data-testid="content">차트</div>
      </LazySection>,
    );

    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    // aria-hidden skeleton이 있어야 함
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("뷰포트에 진입하면 children을 렌더링한다", () => {
    mockIsIntersecting = true;

    render(
      <LazySection>
        <div data-testid="content">차트</div>
      </LazySection>,
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByText("차트")).toBeInTheDocument();
  });

  it("커스텀 fallbackHeight를 적용할 수 있다", () => {
    const { container } = render(
      <LazySection fallbackHeight="500px">
        <div>콘텐츠</div>
      </LazySection>,
    );

    const placeholder = container.querySelector(
      "[aria-hidden='true']",
    ) as HTMLElement;
    expect(placeholder).toHaveStyle({ height: "500px" });
  });

  it("커스텀 className을 적용할 수 있다", () => {
    const { container } = render(
      <LazySection className="my-custom-class">
        <div>콘텐츠</div>
      </LazySection>,
    );

    expect(container.firstChild).toHaveClass("my-custom-class");
  });
});
