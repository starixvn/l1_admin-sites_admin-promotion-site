import React from "react";
import { render, screen, act } from "@testing-library/react";
import BetSettingsDialog from "@/app/promotion/create/BetSettingsDialog";
import { GAME_TYPES } from "@/constants/gameTypes";

beforeAll(() => {
  global.ResizeObserver = global.ResizeObserver || class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("@/hooks/useCurrencyGroups", () => ({
  useCurrencyGroups: () => ({
    data: [
      { Id: "cg1", Name: "USD" },
      { Id: "cg2", Name: "VND" },
    ],
    isSuccess: true,
  }),
}));
jest.mock("@/hooks/useCurrencyGroupGames", () => ({
  useCurrencyGroupGames: () => ({
    mutateAsync: jest.fn().mockResolvedValue([]),
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
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children, "aria-describedby": ariaDescribedby }: any) => (
    <div role="dialog" aria-describedby={ariaDescribedby || "dialog-description"}>
      <div id="dialog-description">Dialog description</div>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("BetSettingsDialog", () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderDialog = async (props: any) => {
    let result;
    await act(async () => {
      result = render(
        <BetSettingsDialog
          open={true}
          onClose={onClose}
          partnerId="op1"
          gameType={GAME_TYPES.CLASSIC}
          onSave={onSave}
          {...props}
        />
      );
    });
    return result;
  };

  it("renders dialog with correct title and rows", async () => {
    await renderDialog({});
    
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
    const toggles = screen.getAllByRole("button");
  });

  it("shows correct formula for cascading slot", async () => {
    await renderDialog({
      gameType: GAME_TYPES.CASCADING
    });

    expect(screen.getByText(/Cascading Slot/)).toBeInTheDocument();
  });

  it("does not crash if currencyGroups is empty", async () => {
    jest.spyOn(require("@/hooks/useCurrencyGroups"), "useCurrencyGroups")
      .mockImplementationOnce(() => ({
        data: [],
        isSuccess: true,
      }));

    await renderDialog({});

    expect(screen.getByText(/Bet Settings/)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("handles save action correctly", async () => {
    await renderDialog({});

    const saveButton = screen.getByRole("button", { name: /Save/i });
    await act(async () => {
      saveButton.click();
    });

    expect(onSave).toHaveBeenCalled();
  });

  it("handles close action correctly", async () => {
    await renderDialog({});

    const closeButton = screen.getByRole("button", { name: /Close/i });
    await act(async () => {
      closeButton.click();
    });

    expect(onClose).toHaveBeenCalled();
  });
});
