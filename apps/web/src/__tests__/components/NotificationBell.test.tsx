import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationBell from "@/components/layout/NotificationBell";

// cn mock
jest.mock("@/lib/utils", () => ({
  cn: (...args: (string | boolean | undefined)[]) =>
    args.filter(Boolean).join(" "),
}));

describe("NotificationBell", () => {
  it("알림 벨 버튼이 렌더링된다", () => {
    render(<NotificationBell />);
    expect(screen.getByRole("button", { name: /알림/i })).toBeInTheDocument();
  });

  it("미읽은 알림 카운트 배지가 표시된다", () => {
    render(<NotificationBell />);
    // 기본 mock 데이터에 3개 미읽은 알림이 있음
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("클릭 시 알림 패널이 열린다", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /알림/i }));

    expect(screen.getByText("알림")).toBeInTheDocument();
    expect(screen.getByText("새 주문 접수")).toBeInTheDocument();
    expect(screen.getByText("재고 부족 경고")).toBeInTheDocument();
  });

  it("모두 읽음 처리 버튼이 동작한다", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /알림/i }));
    await user.click(screen.getByText("모두 읽음 처리"));

    // 모두 읽음 처리 후 배지가 사라짐
    expect(screen.queryByText("모두 읽음 처리")).not.toBeInTheDocument();
  });

  it("개별 알림을 삭제할 수 있다", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /알림/i }));

    const deleteButtons = screen.getAllByLabelText("알림 삭제");
    expect(deleteButtons.length).toBe(5); // 5개 mock 알림

    await user.click(deleteButtons[0]);
    // 삭제 후 4개
    expect(screen.getAllByLabelText("알림 삭제").length).toBe(4);
  });

  it("알림이 없으면 빈 상태 메시지가 표시된다", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /알림/i }));

    // 모든 알림 삭제
    const deleteButtons = screen.getAllByLabelText("알림 삭제");
    for (const btn of deleteButtons) {
      await user.click(btn);
    }

    expect(screen.getByText("알림이 없습니다")).toBeInTheDocument();
  });
});
