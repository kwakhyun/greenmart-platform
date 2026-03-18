import { renderHook, act } from "@testing-library/react";
import { useTheme } from "@/hooks/useTheme";

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// matchMedia mock
const matchMediaListeners: Array<(e: { matches: boolean }) => void> = [];
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(
      (_: string, cb: (e: { matches: boolean }) => void) => {
        matchMediaListeners.push(cb);
      },
    ),
    removeEventListener: jest.fn(),
  })),
});

describe("useTheme", () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove("dark");
  });

  it("초기 마운트 후 mounted가 true가 되어야 한다", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.mounted).toBe(true);
  });

  it("기본 테마는 system이어야 한다", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });

  it("setTheme으로 dark 테마를 설정할 수 있다", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("setTheme으로 light 테마를 설정할 수 있다", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggle이 light → dark로 전환한다", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("light");
    });

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("toggle이 dark → light로 전환한다", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("localStorage에 저장된 테마를 불러온다", () => {
    localStorageMock.setItem("theme", "dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });
});
