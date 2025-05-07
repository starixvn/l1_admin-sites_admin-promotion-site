import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataGrid from "../DataGrid";
import { GAME_TYPES } from "../../../constants/gameTypes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock data
const mockGames = [
  { GameId: 1, DisplayName: "Game 1" },
  { GameId: 2, DisplayName: "Game 2" },
];

const mockPromotions = [
  {
    _id: "1",
    name: "Promotion 1",
    code: "CODE1",
    gameConfigType: GAME_TYPES.CLASSIC,
    bonusItemCount: 10,
    gameIds: [1, 2],
    operatorId: "op1",
    startDate: "2024-03-20T00:00:00Z",
    endDate: "2024-03-25T00:00:00Z",
    betLevels: [],
  },
  {
    _id: "2",
    name: "Promotion 2",
    code: "CODE2",
    gameConfigType: GAME_TYPES.CASCADING,
    bonusItemCount: 20,
    gameIds: [1],
    operatorId: "op2",
    startDate: "2024-03-15T00:00:00Z",
    endDate: "2024-03-18T00:00:00Z",
    betLevels: [],
  },
];

describe("DataGrid Component", () => {
  const mockOnDelete = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    render(
      <DataGrid
        promotions={[]}
        loading={true}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMessage = "Failed to load promotions";
    render(
      <DataGrid
        promotions={[]}
        loading={false}
        error={errorMessage}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <DataGrid
        promotions={[]}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    expect(screen.getByText("No promotions found")).toBeInTheDocument();
  });

  it("renders promotions data correctly", () => {
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    expect(screen.getByText("Promotion 1")).toBeInTheDocument();
    expect(screen.getByText("Promotion 2")).toBeInTheDocument();
    expect(screen.getByText("CODE1")).toBeInTheDocument();
    expect(screen.getByText("CODE2")).toBeInTheDocument();
  });

  it("handles delete promotion", async () => {
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
  });

  it("handles edit promotion", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);

  });

  it("displays correct game type names", () => {
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    expect(screen.getByText("Classic Slots")).toBeInTheDocument();
    expect(screen.getByText("Cascading Slots")).toBeInTheDocument();
  });

  it("displays correct game names", () => {
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    expect(screen.getByText("Game 1, Game 2")).toBeInTheDocument();
    expect(screen.getByText("Game 1")).toBeInTheDocument();
  });

  it("handles successful promotion update", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);
  });

  it("handles failed promotion update", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Update failed"));

    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);
  });

  it("disables edit and delete buttons for completed promotions", () => {
    const completedPromotion = {
      ...mockPromotions[0],
      endDate: "2024-03-10T00:00:00Z", // Past date
    };

    render(
      <DataGrid
        promotions={[completedPromotion]}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    const deleteButton = screen.getByRole("button", { name: /delete/i });

    expect(editButton).toHaveClass("cursor-not-allowed");
    expect(deleteButton).toHaveClass("cursor-not-allowed");
  });
});
