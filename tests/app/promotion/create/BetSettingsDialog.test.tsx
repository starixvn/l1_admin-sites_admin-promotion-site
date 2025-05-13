import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import BetSettingsDialog from "@/app/promotion/create/BetSettingsDialog";
import { GAME_TYPES } from "@/constants/gameTypes";

beforeAll(() => {
  global.ResizeObserver = global.ResizeObserver || class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockCurrencyGroups = [
  { Id: "cg1", Name: "USD" },
  { Id: "cg2", Name: "VND" },
];

const mockGetCurrencyGroupGames = jest.fn().mockResolvedValue([]);
jest.mock("@/hooks/useCurrencyGroupGames", () => ({
  useCurrencyGroupGames: () => ({
    mutateAsync: mockGetCurrencyGroupGames,
  }),
}));

jest.mock("@/lib/promotion/bet-settings.utils", () => ({
  selectSuggestedBetLevel: jest.fn(() => 10),
  validateBetRows: jest.fn((rows) => {
    type Row = { enabled: boolean; betLevel: number; id: string };
    return new Set(
      rows
        .filter((r: Row) => r.enabled && r.betLevel <= 0)
        .map((r: Row) => r.id)
    );
  }),
  getTotalBet: jest.fn(() => 25),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => 
    open ? <div>{children}</div> : null,
  DialogContent: ({ children, "aria-describedby": ariaDescribedby }: any) => (
    <div role="dialog" aria-describedby={ariaDescribedby || "dialog-description"}>
      <div id="dialog-description">Dialog description</div>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("BetSettingsDialog", () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrencyGroupGames.mockClear();
  });

  const renderDialog = async (props: any = {}) => {
    const defaultProps = {
      open: true,
      onClose,
      partnerId: "op1",
      gameType: GAME_TYPES.CLASSIC,
      onSave,
      currencyGroupsInfo: mockCurrencyGroups,
      ...props,
    };

    let result;
    await act(async () => {
      result = render(<BetSettingsDialog {...defaultProps} />);
    });

    // Only wait for API calls if we have currency groups
    if (defaultProps.currencyGroupsInfo?.length > 0) {
      await waitFor(() => {
        expect(mockGetCurrencyGroupGames).toHaveBeenCalledTimes(defaultProps.currencyGroupsInfo.length);
      }, { timeout: 5000 });
    }

    return result;
  };

  it("renders dialog with correct title and rows", async () => {
    await renderDialog();
    
    expect(screen.getByText(/Bet Settings/)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog description")).toBeInTheDocument();
  });

  it("renders in readonly mode (no Save button, toggles disabled)", async () => {
    await renderDialog({
      readonly: true,
      initialValues: [{ currencyGroup: "cg1", betLevel: 10 }]
    });

    expect(screen.queryByRole("button", { name: /Save/i })).not.toBeInTheDocument();
    
    // Find toggle divs by their classes instead of role
    const toggleDivs = screen.getAllByTestId("toggle-button");
    toggleDivs.forEach(div => {
      expect(div).toHaveClass("opacity-50");
      expect(div).toHaveClass("cursor-not-allowed");
    });

    // Verify input is disabled
    const input = screen.getByRole("spinbutton");
    expect(input).toBeDisabled();
  });

  it("shows correct formula for cascading slot", async () => {
    await renderDialog({
      gameType: GAME_TYPES.CASCADING
    });

    expect(screen.getByText(/Cascading Slot/)).toBeInTheDocument();
    expect(screen.getByText(/Coin Value/)).toBeInTheDocument();
  });

  it("does not crash if currencyGroups is empty", async () => {
    await renderDialog({
      currencyGroupsInfo: []
    });

    expect(screen.getByText(/Bet Settings/)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mockGetCurrencyGroupGames).not.toHaveBeenCalled();
    
    // Verify table is empty by finding tbody directly
    const table = screen.getByRole("table");
    const tbody = table.querySelector("tbody");
    expect(tbody?.children.length).toBe(0);
  });

  it("handles save action correctly", async () => {
    await renderDialog();

    const saveButton = screen.getByRole("button", { name: /Save/i });
    await act(async () => {
      saveButton.click();
    });

    expect(onSave).toHaveBeenCalledWith({
      currencyGroups: [],
      betLevels: [],
    });
  });

  it("handles close action correctly", async () => {
    await renderDialog();

    const closeButton = screen.getByRole("button", { name: /Close/i });
    await act(async () => {
      closeButton.click();
    });

    expect(onClose).toHaveBeenCalled();
  });
});
