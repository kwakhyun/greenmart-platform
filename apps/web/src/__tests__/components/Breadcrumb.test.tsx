import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

// usePathname 모킹
const mockPathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("Breadcrumb", () => {
  it("returns null on root path", () => {
    mockPathname.mockReturnValue("/");
    const { container } = render(<Breadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it("renders breadcrumb for /catalog/products", () => {
    mockPathname.mockReturnValue("/catalog/products");
    render(<Breadcrumb />);

    expect(
      screen.getByRole("navigation", { name: "breadcrumb" }),
    ).toBeInTheDocument();
    expect(screen.getByText("카탈로그")).toBeInTheDocument();
    expect(screen.getByText("상품 관리")).toBeInTheDocument();
  });

  it("marks last item with aria-current=page", () => {
    mockPathname.mockReturnValue("/customer/members");
    render(<Breadcrumb />);

    const lastCrumb = screen.getByText("회원 관리");
    expect(lastCrumb).toHaveAttribute("aria-current", "page");
  });

  it("renders home icon link", () => {
    mockPathname.mockReturnValue("/settlement/orders");
    render(<Breadcrumb />);

    const homeLink = screen.getByText("홈");
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders deep path with 3 segments", () => {
    mockPathname.mockReturnValue("/inventory/delivery/abc123");
    render(<Breadcrumb />);

    expect(screen.getByText("인벤토리")).toBeInTheDocument();
    expect(screen.getByText("배송 관리")).toBeInTheDocument();
    expect(screen.getByText("abc123")).toHaveAttribute("aria-current", "page");
  });
});
