import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataGrid from "../../../src/app/promotion/DataGrid";
import { GAME_TYPES } from "../../../src/constants/gameTypes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

global.fetch = jest.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  return <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>;
};

const mockGames = [
  { GameId: 1, DisplayName: "Game 1", Type: 1 },
  { GameId: 2, DisplayName: "Game 2", Type: 1 },
];

const mockPromotions = Array.from({ length: 15 }).map((_, i) => ({
  _id: `${i + 1}`,
  name: `Promotion ${i + 1}`,
  code: `CODE${i + 1}`,
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
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  status: "ACTIVE",
  __v: 0,
}));

describe("DataGrid Component with Pagination", () => {
  const mockOnDelete = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows 10 rows per page and paginates correctly", () => {
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

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeLessThanOrEqual(11); // 1 header + 10 rows
    const nextPageBtn = screen.getByRole("button", { name: ">" });
    fireEvent.click(nextPageBtn);
    expect(screen.getByText("Promotion 11")).toBeInTheDocument();
  });
});
