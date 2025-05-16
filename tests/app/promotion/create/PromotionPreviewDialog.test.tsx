import { render, screen, fireEvent } from "@testing-library/react";
import PromotionPreviewDialog from "@/app/promotion/create/PromotionPreviewDialog";
import type { PromotionFormValues } from "@/app/promotion/create/PromotionForm";
import type { Game } from "@/types/game";
import type { CurrencyGroup } from "@/types/currency-group";
import { GAME_TYPES } from "@/constants/gameTypes";

// Mock the Dialog component
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({
    children,
    className,
    "aria-describedby": ariaDescribedby,
  }: any) => (
    <div className={className} aria-describedby={ariaDescribedby}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 className={className}>{children}</h2>
  ),
}));

// Mock PromotionViewForm
jest.mock("@/app/promotion/create/PromotionViewForm", () => {
  return function MockPromotionViewForm({ data, readonly }: any) {
    return (
      <div data-testid="mock-promotion-view-form">
        <div>Mock Promotion View Form</div>
        <div>Readonly: {readonly ? "true" : "false"}</div>
        <div>Data: {JSON.stringify(data)}</div>
      </div>
    );
  };
});

describe("PromotionPreviewDialog", () => {
  const mockData: PromotionFormValues = {
    name: "Test Promotion",
    code: "TEST123",
    bonusItemCount: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    operatorId: "op1",
    gameConfigType: GAME_TYPES.CLASSIC,
    gameIds: [1, 2],
    currencyGroups: ["cg1"],
    allPlayers: true,
    offeredPlayerIds: [],
    betLevels: [{ currencyGroup: "cg1", betLevel: 10 }],
  };

  const mockGameList: Game[] = [
    {
      GameId: 1,
      DisplayName: "Test Game",
      Type: GAME_TYPES.CLASSIC,
    },
  ];

  const mockCurrencyGroups: CurrencyGroup[] = [
    {
      Id: "cg1",
      Name: "Test Currency Group",
    },
  ];

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    data: mockData,
    operatorName: "Test Operator",
    gameList: mockGameList,
    currencyGroupsInfo: mockCurrencyGroups,
    onConfirm: jest.fn(),
    isSubmitting: false,
    readonly: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog when open is true", () => {
    render(<PromotionPreviewDialog {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("mock-promotion-view-form")).toBeInTheDocument();
  });

  it("does not render dialog when open is false", () => {
    render(<PromotionPreviewDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when back button is clicked", () => {
    render(<PromotionPreviewDialog {...defaultProps} />);

    const backButton = screen.getByText("← Back");
    fireEvent.click(backButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm with data when confirm button is clicked", () => {
    render(<PromotionPreviewDialog {...defaultProps} />);

    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledWith(mockData);
  });

  it("disables confirm button when isSubmitting is true", () => {
    render(<PromotionPreviewDialog {...defaultProps} isSubmitting={true} />);
    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toBeDisabled();
  });

  it("shows only close button in readonly mode", () => {
    render(<PromotionPreviewDialog {...defaultProps} readonly={true} />);
    expect(screen.queryByText("← Back")).not.toBeInTheDocument();
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("passes correct props to PromotionViewForm in edit mode", () => {
    render(<PromotionPreviewDialog {...defaultProps} readonly={false} />);
    const viewForm = screen.getByTestId("mock-promotion-view-form");
    expect(viewForm).toHaveTextContent("Readonly: false");
    expect(viewForm).toHaveTextContent(`Data: ${JSON.stringify(mockData)}`);
  });

  it("passes correct props to PromotionViewForm in readonly mode", () => {
    render(<PromotionPreviewDialog {...defaultProps} readonly={true} />);
    const viewForm = screen.getByTestId("mock-promotion-view-form");
    expect(viewForm).toHaveTextContent("Readonly: true");
  });
});
