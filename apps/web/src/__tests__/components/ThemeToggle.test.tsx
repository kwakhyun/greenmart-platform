import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/components/layout/ThemeToggle";

// useTheme mock
const mockToggle = jest.fn();
let mockResolvedTheme = "light";
let mockMounted = true;

jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    toggle: mockToggle,
    mounted: mockMounted,
  }),
}));

// useKeyboardShortcut mock
jest.mock("@/hooks/useKeyboardShortcut", () => ({
  useKeyboardShortcut: jest.fn(),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockToggle.mockClear();
    mockResolvedTheme = "light";
    mockMounted = true;
  });

  it("라이트 모드에서 '다크 모드로 전환' 라벨을 표시한다", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText("다크 모드로 전환")).toBeInTheDocument();
  });

  it("다크 모드에서 '라이트 모드로 전환' 라벨을 표시한다", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByLabelText("라이트 모드로 전환")).toBeInTheDocument();
  });

  it("클릭 시 toggle이 호출된다", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("마운트 전에는 스켈레톤 placeholder를 표시한다", () => {
    mockMounted = false;
    const { container } = render(<ThemeToggle />);

    // 스켈레톤은 button이 아님
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("⌘D 타이틀 힌트가 있다", () => {
    render(<ThemeToggle />);
    expect(screen.getByTitle("⌘D")).toBeInTheDocument();
  });
});
