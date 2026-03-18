import { renderHook } from "@testing-library/react";
import {
  useKeyboardShortcut,
  getRegisteredShortcuts,
} from "@/hooks/useKeyboardShortcut";

describe("useKeyboardShortcut", () => {
  it("⌘K 단축키 핸들러가 호출된다", () => {
    const handler = jest.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "k",
        meta: true,
        handler,
        description: "테스트 단축키",
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("meta 없이는 핸들러가 호출되지 않는다", () => {
    const handler = jest.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "k",
        meta: true,
        handler,
        description: "테스트 단축키",
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: false,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it("다른 키는 핸들러를 트리거하지 않는다", () => {
    const handler = jest.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "k",
        meta: true,
        handler,
        description: "테스트 단축키",
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "d",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it("Ctrl 키도 meta로 인식한다 (Windows 호환)", () => {
    const handler = jest.fn();

    renderHook(() =>
      useKeyboardShortcut({
        key: "k",
        meta: true,
        handler,
        description: "테스트 단축키",
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("언마운트 시 이벤트 리스너가 해제된다", () => {
    const handler = jest.fn();

    const { unmount } = renderHook(() =>
      useKeyboardShortcut({
        key: "k",
        meta: true,
        handler,
        description: "테스트 단축키",
      }),
    );

    unmount();

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it("getRegisteredShortcuts가 등록된 단축키를 반환한다", () => {
    const handler = jest.fn();

    const { unmount } = renderHook(() =>
      useKeyboardShortcut({
        key: "t",
        meta: true,
        handler,
        description: "테스트용",
      }),
    );

    const shortcuts = getRegisteredShortcuts();
    expect(shortcuts.some((s) => s.key === "t")).toBe(true);

    unmount();
  });
});
