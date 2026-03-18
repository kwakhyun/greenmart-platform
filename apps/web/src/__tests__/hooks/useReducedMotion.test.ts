import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

describe("useReducedMotion", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  function mockMatchMedia(matches: boolean) {
    const listeners: Array<(e: { matches: boolean }) => void> = [];
    window.matchMedia = jest.fn().mockReturnValue({
      matches,
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
        listeners.push(cb);
      },
      removeEventListener: jest.fn(),
    });
    return listeners;
  }

  it("returns false when prefers-reduced-motion is not set", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion: reduce", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when media query changes", () => {
    const listeners = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      listeners.forEach((cb) => cb({ matches: true }));
    });

    expect(result.current).toBe(true);
  });
});
