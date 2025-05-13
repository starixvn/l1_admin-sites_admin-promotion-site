import React from "react";
import { render, screen } from "@testing-library/react";
import PromotionViewForm from "../../../../src/app/promotion/create/PromotionViewForm";
import { GAME_TYPES } from "../../../../src/constants/gameTypes";
import type { Game } from "../../../../src/types/game";

describe("PromotionViewForm", () => {
  const mockData = {
    name: "Test Promotion",
    code: "TEST123",
    gameConfigType: GAME_TYPES.CLASSIC,
    bonusItemCount: 100,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
    operatorId: "op1",
    offeredSiteNames: ["site1", "site2"],
    gameIds: [1, 2],
    currencyGroups: ["USD", "EUR"],
    allPlayers: false,
    offeredPlayerIds: ["player1", "player2"],
    uploadedFile: new File([""], "players.csv"),
    betLevels: [
      { currencyGroup: "USD", betLevel: 1 },
      { currencyGroup: "EUR", betLevel: 2 },
    ],
  };

  const mockGameList: Game[] = [
    { GameId: 1, DisplayName: "Game 1", Type: 1 },
    { GameId: 2, DisplayName: "Game 2", Type: 1 },
    { GameId: 3, DisplayName: "Game 3", Type: 1 },
  ];

  it("renders all sections with complete data", () => {
    render(
      <PromotionViewForm
        data={mockData}
        operatorName="Test Operator"
        gameList={mockGameList}
      />
    );

    // Basic Information section
    expect(screen.getByText("📋 Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Test Promotion")).toBeInTheDocument();
    expect(screen.getByText("TEST123")).toBeInTheDocument();
    expect(screen.getByText("Classic Slot")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Test Operator")).toBeInTheDocument();

    // Site Offering section
    expect(screen.getByText("🌐 Site Offering")).toBeInTheDocument();
    expect(screen.getByText("site1; site2")).toBeInTheDocument();

    // Game List section
    expect(screen.getByText("🎮 Selected Games")).toBeInTheDocument();
    expect(screen.getByText("Game 1")).toBeInTheDocument();
    expect(screen.getByText("Game 2")).toBeInTheDocument();

    // Target Members section
    expect(screen.getByText("👥 Target Members")).toBeInTheDocument();
    expect(screen.getByText("Players from File")).toBeInTheDocument();
    expect(screen.getByText("player1")).toBeInTheDocument();
    expect(screen.getByText("player2")).toBeInTheDocument();

    // Bet Settings section
    expect(screen.getByText("🎰 Bet Settings")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders with minimal data", () => {
    const minimalData = {
      name: "Minimal Promotion",
      code: "MIN123",
      gameConfigType: GAME_TYPES.CLASSIC,
      bonusItemCount: 50,
      startDate: new Date(),
      endDate: new Date(),
      operatorId: "op1",
      gameIds: [],
      currencyGroups: [],
      allPlayers: true,
    };

    render(<PromotionViewForm data={minimalData} />);

    // Basic Information section
    expect(screen.getByText("Minimal Promotion")).toBeInTheDocument();
    expect(screen.getByText("MIN123")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("op1")).toBeInTheDocument();

    // Site Offering section
    expect(screen.getByText("(All sites)")).toBeInTheDocument();

    // Game List section
    expect(screen.getByText("No games selected")).toBeInTheDocument();

    // Target Members section
    expect(screen.getByText("All Players")).toBeInTheDocument();

    // Bet Settings section
    expect(screen.getByText("No bet settings configured.")).toBeInTheDocument();
  });

  it("renders cascading slot game type", () => {
    const cascadingData = {
      ...mockData,
      gameConfigType: GAME_TYPES.CASCADING,
    };

    render(<PromotionViewForm data={cascadingData} />);
    expect(screen.getByText("Cascading Slot")).toBeInTheDocument();
  });

  it("renders with no player list when allPlayers is true", () => {
    const allPlayersData = {
      ...mockData,
      allPlayers: true,
      offeredPlayerIds: undefined,
      uploadedFile: undefined,
    };

    render(<PromotionViewForm data={allPlayersData} />);
    expect(screen.getByText("All Players")).toBeInTheDocument();
    expect(screen.queryByText("Uploaded File:")).not.toBeInTheDocument();
  });
});
