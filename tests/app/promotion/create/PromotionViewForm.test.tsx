import React from "react";
import { render, screen } from "@testing-library/react";
import PromotionViewForm from "@/app/promotion/create/PromotionViewForm";
import { GAME_TYPES } from "@/constants/gameTypes";
import type { Game } from "@/types/game";

describe("PromotionViewForm", () => {
  it("renders all sections with complete data", () => {
    const mockData = {
      name: "Test Promotion",
      code: "TEST123",
      gameConfigType: GAME_TYPES.CLASSIC,
      bonusItemCount: 100,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      claimExpirationDate: new Date("2024-02-01"),
      operatorId: "op1",
      offeredSiteNames: ["site1", "site2"],
      gameIds: [1, 2],
      currencyGroups: ["USD", "EUR"],
      allPlayers: false,
      betLevels: [
        { currencyGroup: "USD", betLevel: 1 },
        { currencyGroup: "EUR", betLevel: 2 },
      ],
      isGiftCode: false,
      minTurnoverMultiplier: 2,
    };

    const mockGameList: Game[] = [
      { GameId: 1, DisplayName: "Game 1", Type: 1 },
      { GameId: 2, DisplayName: "Game 2", Type: 1 },
    ];

    const mockCurrencyGroups = [
      { Id: "USD", Name: "USD" },
      { Id: "EUR", Name: "EUR" },
    ];

    render(
      <PromotionViewForm
        data={mockData}
        operatorName="Test Operator"
        gameList={mockGameList}
        currencyGroupsInfo={mockCurrencyGroups}
      />
    );

    // General Information section
    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Test Promotion")).toBeInTheDocument();
    expect(screen.getByText("TEST123")).toBeInTheDocument();
    expect(screen.getByText("Classic Slot")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Test Operator")).toBeInTheDocument();

    // Currency Group Settings section
    expect(screen.getByText("Configuration & Game Specifics")).toBeInTheDocument();
    expect(screen.getByText("site1; site2")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();

    // Site Offering section
    expect(screen.getByText("site1; site2")).toBeInTheDocument();

    // Game List section
    expect(screen.getByText("Game 1, Game 2")).toBeInTheDocument();

    // Members section
    expect(screen.getByText("Targeting Information")).toBeInTheDocument();
    expect(screen.getByText("Players from File")).toBeInTheDocument();
  });

  it("renders with minimal data", () => {
    const mockData = {
      name: "Minimal Promotion",
      code: "MIN123",
      gameConfigType: GAME_TYPES.CLASSIC,
      bonusItemCount: 50,
      startDate: new Date("2025-05-13T08:04:27.000Z"),
      endDate: new Date("2025-05-13T08:04:27.000Z"),
      claimExpirationDate: new Date("2025-05-14T08:04:27.000Z"),
      operatorId: "op1",
      offeredSiteNames: [],
      gameIds: [],
      currencyGroups: [],
      allPlayers: true,
      betLevels: [],
      isGiftCode: false,
      minTurnoverMultiplier: 2,
    };

    render(<PromotionViewForm data={mockData} />);

    // General Information section
    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Minimal Promotion")).toBeInTheDocument();
    expect(screen.getByText("MIN123")).toBeInTheDocument();
    expect(screen.getByText("Classic Slot")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("op1")).toBeInTheDocument();

    // Currency Group Settings section
    expect(screen.getByText("Configuration & Game Specifics")).toBeInTheDocument();

    // Site Offering section
    expect(screen.getByText("All Sites")).toBeInTheDocument();

    // Game List section
    expect(screen.getByText("Target Game")).toBeInTheDocument();
    expect(screen.getByText("Currency Groups")).toBeInTheDocument();

    // Members section
    expect(screen.getByText("Targeting Information")).toBeInTheDocument();
    expect(screen.getByText("All Players")).toBeInTheDocument();
  });

  it("renders cascading slot game type", () => {
    const mockData = {
      name: "Cascading Promotion",
      code: "CAS123",
      gameConfigType: GAME_TYPES.CASCADING,
      bonusItemCount: 50,
      startDate: new Date("2025-05-13T08:04:27.000Z"),
      endDate: new Date("2025-05-13T08:04:27.000Z"),
      claimExpirationDate: new Date("2025-05-14T08:04:27.000Z"),
      operatorId: "op1",
      offeredSiteNames: [],
      gameIds: [],
      currencyGroups: [],
      allPlayers: true,
      betLevels: [],
      isGiftCode: false,
      minTurnoverMultiplier: 2,
    };

    render(<PromotionViewForm data={mockData} />);

    expect(screen.getByText("Cascading Slot")).toBeInTheDocument();
  });

  it("renders with no player list when allPlayers is true", () => {
    const mockData = {
      name: "All Players Promotion",
      code: "ALL123",
      gameConfigType: GAME_TYPES.CLASSIC,
      bonusItemCount: 50,
      startDate: new Date("2025-05-13T08:04:27.000Z"),
      endDate: new Date("2025-05-13T08:04:27.000Z"),
      claimExpirationDate: new Date("2025-05-14T08:04:27.000Z"),
      operatorId: "op1",
      offeredSiteNames: [],
      gameIds: [],
      currencyGroups: [],
      allPlayers: true,
      betLevels: [],
      isGiftCode: false,
      minTurnoverMultiplier: 2,
    };

    render(<PromotionViewForm data={mockData} />);

    expect(screen.getByText("All Players")).toBeInTheDocument();
  });

  it("renders currency groups correctly", () => {
    const mockData = {
      name: "Currency Test Promotion",
      code: "CUR123",
      gameConfigType: GAME_TYPES.CLASSIC,
      bonusItemCount: 50,
      startDate: new Date("2025-05-13T08:04:27.000Z"),
      endDate: new Date("2025-05-13T08:04:27.000Z"),
      claimExpirationDate: new Date("2025-05-14T08:04:27.000Z"),
      operatorId: "op1",
      offeredSiteNames: [],
      gameIds: [],
      currencyGroups: ["USD", "EUR", "GBP"],
      allPlayers: true,
      betLevels: [],
      isGiftCode: false,
      minTurnoverMultiplier: 2,
    };

    const mockCurrencyGroups = [
      { Id: "USD", Name: "USD" },
      { Id: "EUR", Name: "EUR" },
      { Id: "GBP", Name: "GBP" },
    ];

    render(
      <PromotionViewForm
        data={mockData}
        currencyGroupsInfo={mockCurrencyGroups}
      />
    );

    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
    expect(screen.getByText("GBP")).toBeInTheDocument();
  });

  it("renders dash when no currency groups", () => {
    const mockData = {
      name: "No Currency Promotion",
      code: "NOCUR123",
      gameConfigType: GAME_TYPES.CLASSIC,
      bonusItemCount: 50,
      startDate: new Date("2025-05-13T08:04:27.000Z"),
      endDate: new Date("2025-05-13T08:04:27.000Z"),
      claimExpirationDate: new Date("2025-05-14T08:04:27.000Z"),
      operatorId: "op1",
      offeredSiteNames: [],
      gameIds: [],
      currencyGroups: [],
      allPlayers: true,
      betLevels: [],
      isGiftCode: false,
      minTurnoverMultiplier: 2,
    };

    render(<PromotionViewForm data={mockData} />);

    // Check that Currency Groups label exists
    expect(screen.getByText("Currency Groups")).toBeInTheDocument();
    
    // Check that dash is displayed for empty currency groups
    const currencyGroupsSection = screen.getByText("Currency Groups").closest("div");
    expect(currencyGroupsSection).toHaveTextContent("-");
  });
});
