import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

jest.useFakeTimers();

describe("useDebounce", () => {
  it("지정된 딜레이 후에 값을 반환한다", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 300 } },
    );

    expect(result.current).toBe("hello");

    rerender({ value: "world", delay: 300 });
    expect(result.current).toBe("hello");

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("world");
  });

  it("딜레이 내 연속 변경 시 마지막 값만 반영된다", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 500),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "abc" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "abcd" });
    expect(result.current).toBe("a"); // 아직 디바운스 안 됨

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("abcd");
  });

  it("숫자 값도 디바운싱된다", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebounce(value, 100),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(42);
  });
});
