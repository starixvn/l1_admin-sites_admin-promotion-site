import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import BetSettingsDialog from "@/app/promotion/create/BetSettingsDialog";
import { GAME_TYPES } from "@/constants/gameTypes";

beforeAll(() => {
  global.ResizeObserver =
    global.ResizeObserver ||
    class {
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
  createOperatorMap: jest.fn(() => new Map()),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children, "aria-describedby": ariaDescribedby }: any) => (
    <div
      role="dialog"
      aria-describedby={ariaDescribedby || "dialog-description"}
    >
      <div id="dialog-description">Dialog description</div>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
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
      await waitFor(
        () => {
          expect(mockGetCurrencyGroupGames).toHaveBeenCalledTimes(
            defaultProps.currencyGroupsInfo.length
          );
        },
        { timeout: 5000 }
      );
    }

    return result;
  };

  it("renders dialog with correct title and rows", async () => {
    await renderDialog();

    expect(screen.getByText(/Currency Group Settings/)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog description")).toBeInTheDocument();
  });

  it("renders in readonly mode (no Save button, toggles disabled)", async () => {
    await renderDialog({
      readonly: true,
      initialValues: [{ currencyGroup: "cg1", betLevel: 10 }],
    });

    expect(
      screen.queryByRole("button", { name: /Save/i })
    ).not.toBeInTheDocument();

    // Find toggle divs by their classes instead of role
    const toggleDivs = screen.getAllByTestId("toggle-button");
    toggleDivs.forEach((div) => {
      expect(div).toHaveClass("opacity-50");
      expect(div).toHaveClass("cursor-not-allowed");
    });

    // Verify input is disabled
    const input = screen.getByRole("spinbutton");
    expect(input).toBeDisabled();
  });

  it("shows correct formula for cascading slot", async () => {
    await renderDialog({
      gameType: GAME_TYPES.CASCADING,
    });

    expect(screen.getByText(/Cascading Slot/)).toBeInTheDocument();
    expect(screen.getByText(/Coin Value/)).toBeInTheDocument();
  });

  it("does not crash if currencyGroups is empty", async () => {
    await renderDialog({
      currencyGroupsInfo: [],
    });

    expect(screen.getByText(/Currency Group Settings/)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mockGetCurrencyGroupGames).not.toHaveBeenCalled();

    // Verify table is empty by finding tbody directly
    const table = screen.getByRole("table");
    const tbody = table.querySelector("tbody");
    expect(tbody?.children.length).toBe(0);
  });

  it("does NOT call onSave if no currency group is enabled", async () => {
    await renderDialog(); // assumes this sets up dialog with open = true and default props

    const saveButton = screen.getByRole("button", { name: /Save/i });
    await act(async () => {
      saveButton.click();
    });

    expect(onSave).not.toHaveBeenCalled();

    // Optionally: check for the error message
    expect(
      screen.getByText(/at least one currency group must be enabled/i)
    ).toBeInTheDocument();
  });

  it("calls onSave with valid data when enabled rows have valid betLevel", async () => {
    const initialValues = [
      { currencyGroup: "cg1", betLevel: 10 },
      { currencyGroup: "cg2", betLevel: 20 },
    ];

    await renderDialog({ initialValues });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    await act(async () => {
      saveButton.click();
    });

    expect(onSave).toHaveBeenCalledWith({
      currencyGroups: ["cg1", "cg2"],
      betLevels: [
        { currencyGroup: "cg1", betLevel: 10 },
        { currencyGroup: "cg2", betLevel: 20 },
      ],
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

  it("handleToggleAll enables and disables all rows", async () => {
    await renderDialog();

    let toggles = screen.getAllByTestId("toggle-button");
    toggles.forEach((div) => {
      expect(div).toHaveClass("bg-gray-300");
    });

    const enableAllDiv = screen
      .getAllByText("Enable All")[0]
      .parentElement?.querySelector(".bg-gray-300, .bg-green-500");
    await act(async () => {
      if (enableAllDiv)
        enableAllDiv.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    toggles = screen.getAllByTestId("toggle-button");
    toggles.forEach((div) => {
      expect(div).toHaveClass("bg-green-500");
    });

    const disableAllDiv = screen
      .getAllByText("Enable All")[0]
      .parentElement?.querySelector(".bg-green-500");
    await act(async () => {
      if (disableAllDiv)
        disableAllDiv.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    toggles = screen.getAllByTestId("toggle-button");
    toggles.forEach((div) => {
      expect(div).toHaveClass("bg-gray-300");
    });
  });

  it("handleToggle enables and disables a single row", async () => {
    await renderDialog();

    let toggles = screen.getAllByTestId("toggle-button");
    toggles.forEach((div) => {
      expect(div).toHaveClass("bg-gray-300");
    });

    await act(async () => {
      toggles[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    toggles = screen.getAllByTestId("toggle-button");
    expect(toggles[0]).toHaveClass("bg-green-500");
    expect(toggles[1]).toHaveClass("bg-gray-300");

    await act(async () => {
      toggles[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    toggles = screen.getAllByTestId("toggle-button");
    expect(toggles[0]).toHaveClass("bg-green-500");
    expect(toggles[1]).toHaveClass("bg-green-500");

    await act(async () => {
      toggles[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    toggles = screen.getAllByTestId("toggle-button");
    expect(toggles[0]).toHaveClass("bg-gray-300");
    expect(toggles[1]).toHaveClass("bg-green-500");
  });

  it("handleChangeBet updates bet level for a row", async () => {
    await renderDialog();

    let toggles = screen.getAllByTestId("toggle-button");
    await act(async () => {
      toggles[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    let inputs = screen.getAllByRole("spinbutton");
    expect(inputs[0]).toHaveValue(10);

    await act(async () => {
      (inputs[0] as HTMLInputElement).value = "20";
      (inputs[0] as HTMLInputElement).dispatchEvent(
        new Event("input", { bubbles: true })
      );
    });
    inputs = screen.getAllByRole("spinbutton");
    expect(inputs[0]).toHaveValue(20);

    await act(async () => {
      toggles[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    inputs = screen.getAllByRole("spinbutton");
    expect(inputs[1]).toHaveValue(10);

    await act(async () => {
      (inputs[0] as HTMLInputElement).value = "";
      (inputs[0] as HTMLInputElement).dispatchEvent(
        new Event("input", { bubbles: true })
      );
    });
    inputs = screen.getAllByRole("spinbutton");
  });

  it("handleSave shows error and does not call onSave if there are invalid rows", async () => {
    jest
      .spyOn(require("@/lib/promotion/bet-settings.utils"), "validateBetRows")
      .mockImplementation(() => new Set(["cg1"]));

    await renderDialog();

    let toggles = screen.getAllByTestId("toggle-button");
    await act(async () => {
      toggles[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    await act(async () => {
      saveButton.click();
    });

    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText("❗ Input value must be greater than 0")
    ).toBeInTheDocument();
  });
});
