import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Modal } from "@/components/ui/Modal";

describe("Modal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="테스트">
        <p>내용</p>
      </Modal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title and children when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="확인 모달">
        <p>모달 내용입니다</p>
      </Modal>,
    );
    expect(screen.getByText("확인 모달")).toBeInTheDocument();
    expect(screen.getByText("모달 내용입니다")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="제목"
        description="부가 설명"
      >
        <p>내용</p>
      </Modal>,
    );
    expect(screen.getByText("부가 설명")).toBeInTheDocument();
  });

  it("calls onClose when ESC key is pressed", async () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="ESC 테스트">
        <p>내용</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="닫기 테스트">
        <p>내용</p>
      </Modal>,
    );

    const closeButton = screen.getByLabelText("닫기");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
