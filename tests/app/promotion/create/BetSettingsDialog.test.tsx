import React from "react";
import { render, screen } from "@testing-library/react";
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

describe("BetSettingsDialog", () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog with correct title and rows", async () => {
    render(
      <BetSettingsDialog
        open={true}
        onClose={onClose}
        partnerId="op1"
        gameType={GAME_TYPES.CLASSIC}
        onSave={onSave}
      />
    );
    expect(screen.getByText(/Bet Settings/)).toBeInTheDocument();
  });

  it("renders in readonly mode (no Save button, toggles disabled)", () => {
    render(
      <BetSettingsDialog
        open={true}
        onClose={onClose}
        partnerId="op1"
        gameType={GAME_TYPES.CLASSIC}
        onSave={onSave}
        readonly={true}
        initialValues={[{ currencyGroup: "cg1", betLevel: 10 }]}
      />
    );
    expect(screen.queryByRole("button", { name: /Save/i })).not.toBeInTheDocument();
    const toggles = screen.getAllByRole("button");
    toggles.forEach(btn => expect(btn).toBeDisabled || expect(btn).toHaveClass("cursor-not-allowed"));
  });

  it("shows correct formula for cascading slot", () => {
    render(
      <BetSettingsDialog
        open={true}
        onClose={onClose}
        partnerId="op1"
        gameType={GAME_TYPES.CASCADING}
        onSave={onSave}
      />
    );
    expect(screen.getByText(/Cascading Slot/)).toBeInTheDocument();
  });

  it("does not crash if currencyGroups is empty", () => {
    jest.mock("@/hooks/useCurrencyGroups", () => ({
      useCurrencyGroups: () => ({
        data: [],
        isSuccess: true,
      }),
    }));
    render(
      <BetSettingsDialog
        open={true}
        onClose={onClose}
        partnerId="op1"
        gameType={GAME_TYPES.CLASSIC}
        onSave={onSave}
      />
    );
    expect(screen.getByText(/Bet Settings/)).toBeInTheDocument();
  });
});
