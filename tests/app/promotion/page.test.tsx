import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PromotionPage from "../../../src/app/promotion/page";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GAME_TYPES } from "@/constants/gameTypes";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

jest.mock("@/hooks/useUpdatePromotion", () => ({
  useUpdatePromotion: () => ({
    mutate: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  );
};

const mockOperators = [
  { Name: "Operator 1", PartnerId: "op1" },
  { Name: "Operator 2", PartnerId: "op2" },
];

const mockGames = [
  { GameId: 1, GameName: "Game 1" },
  { GameId: 2, GameName: "Game 2" },
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
    __v: 0,
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
    __v: 0,
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
    __v: 0,
  },
];

describe("PromotionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/operators")
        return Promise.resolve({ data: mockOperators });
      if (url === "/api/games") return Promise.resolve({ data: mockGames });
      if (url.includes("/api/promotions"))
        return Promise.resolve({ data: mockPromotions });
      return Promise.reject(new Error("Not found"));
    });
  });

  const waitForDataToLoad = async () => {
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  };

  it("renders the promotion management page", async () => {
    render(<PromotionPage />, { wrapper });
    expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    await waitForDataToLoad();
  });

  it("fetches and displays operators and games on mount", async () => {
    render(<PromotionPage />, { wrapper });
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/operators");
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/games");
    });
  });

  it("handles filter changes and search", async () => {
    render(<PromotionPage />, { wrapper });
    await waitForDataToLoad();
    const filterInput = screen.getByPlaceholderText("Enter promotion code");
    fireEvent.change(filterInput, { target: { value: "test" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/promotions")
      );
    });
  });

  it("cancels delete when Cancel is clicked", async () => {
    render(<PromotionPage />, { wrapper });

    await waitForDataToLoad();

    const deleteButton = screen.getAllByLabelText("delete-promotion")[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /^cancel$/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });
  });
});
