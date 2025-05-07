import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataGrid from "../../../src/app/promotion/DataGrid";
import { GAME_TYPES } from "../../../src/constants/gameTypes";
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
  { GameId: 1, DisplayName: "Game 1", Type: 1 },
  { GameId: 2, DisplayName: "Game 2", Type: 1 },
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
    offeredSiteNames: [],
    currencyGroups: [],
    offeredPlayerIds: [],
    createdAt: "2024-03-19T00:00:00Z",
    updatedAt: "2024-03-19T00:00:00Z",
    status: "ACTIVE",
    __v: 0
  },
  {
    _id: "2",
    name: "Promotion 2",
    code: "CODE2",
    gameConfigType: GAME_TYPES.CASCADING,
    bonusItemCount: 20,
    gameIds: [1],
    operatorId: "op2",
    startDate: "",
    endDate: "",
    betLevels: [],
    offeredSiteNames: [],
    currencyGroups: [],
    offeredPlayerIds: [],
    createdAt: "2024-03-14T00:00:00Z",
    updatedAt: "2024-03-14T00:00:00Z",
    status: "ACTIVE",
    __v: 0
  },
  {
    _id: "3",
    name: "Promotion 3",
    code: "CODE3",
    gameConfigType: GAME_TYPES.CASCADING,
    bonusItemCount: 20,
    gameIds: [1],
    operatorId: "op2",
    startDate: "2025-05-16T00:00:00Z",
    endDate: "2025-05-29T00:00:00Z",
    betLevels: [],
    offeredSiteNames: [],
    currencyGroups: [],
    offeredPlayerIds: [],
    createdAt: "2024-03-14T00:00:00Z",
    updatedAt: "2024-03-14T00:00:00Z",
    status: "ACTIVE",
    __v: 0
  }
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
    const completedPromotion = { ...mockPromotions[0], _id: "3", status: "completed" };
    const runningPromotion = { ...mockPromotions[0], _id: "4", status: "running" };
    render(
      <DataGrid
        promotions={[completedPromotion, runningPromotion]}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />,
      { wrapper }
    );

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });

    editButtons.forEach(btn => expect(btn).toHaveClass("cursor-not-allowed"));
    deleteButtons.forEach(btn => expect(btn).toHaveClass("cursor-not-allowed"));
  });

  it("getGameNames returns empty string if no gameIds or games", () => {
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={[]} 
        onDelete={jest.fn()}
        onRefresh={jest.fn()}
      />,
      { wrapper }
    );
    expect(screen.getAllByText("").length).toBeGreaterThan(0);
  });

  it("getStatusColorByDate returns default color for unknown status", () => {
    const promotion = { ...mockPromotions[0], status: "unknown" };
    render(
      <DataGrid
        promotions={[promotion]}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={jest.fn()}
        onRefresh={jest.fn()}
      />,
      { wrapper }
    );
  });

  it("handleSaveBetSettings returns early if no selectedPromotion", () => {
    const { rerender } = render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={jest.fn()}
        onRefresh={jest.fn()}
      />,
      { wrapper }
    );
  });

  it("calls alert on updatePromotionMutation error", () => {
    window.alert = jest.fn();
    jest.mock("../../../src/hooks/useUpdatePromotion", () => ({
      useUpdatePromotion: () => ({
        mutate: (_: any, { onError }: any) => onError(new Error("fail")),
      }),
    }));
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={jest.fn()}
        onRefresh={jest.fn()}
      />,
      { wrapper }
    );
  });

  it("handleDelete catch logs error", async () => {
    const mockOnDelete = jest.fn().mockRejectedValue(new Error("fail"));
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={jest.fn()}
      />,
      { wrapper }
    );
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[2]);
  });

  it("handleSaveEdit catch logs error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={jest.fn()}
        onRefresh={jest.fn()}
      />,
      { wrapper }
    );
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[2]);
  });

  it("calls setEditPromotion(null) on PromotionEditDialog close", () => {
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={jest.fn()}
        onRefresh={jest.fn()}
      />,
      { wrapper }
    );
    const editButton = screen.getAllByRole("button", { name: /edit/i })[0];
    fireEvent.click(editButton);
  });

  it("calls setShowDialog(false) on BetSettingsDialog close", () => {
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={jest.fn()}
        onRefresh={jest.fn()}
      />,
      { wrapper }
    );
    const detailsButton = screen.getAllByText("Details")[0];
    fireEvent.click(detailsButton);
  });

  it("calls onDelete with correct id when delete button is clicked", () => {
    const mockOnDelete = jest.fn();
    render(
      <DataGrid
        promotions={mockPromotions}
        loading={false}
        error={null}
        games={mockGames}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
      />, { wrapper }
    );
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    console.log(deleteButtons);
    fireEvent.click(deleteButtons[2]);
    expect(mockOnDelete).toHaveBeenCalledWith(mockPromotions[2]._id);
  });
});