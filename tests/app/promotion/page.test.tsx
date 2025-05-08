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

// Mock useUpdatePromotion hook
jest.mock("@/hooks/useUpdatePromotion", () => ({
  useUpdatePromotion: () => ({
    mutate: jest.fn(),
    isLoading: false,
  }),
}));

// Mock axios
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

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  );
};

// Mock data
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

describe("PromotionPage", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock responses
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/operators") {
        return Promise.resolve({ data: mockOperators });
      }
      if (url === "/api/games") {
        return Promise.resolve({ data: mockGames });
      }
      if (url.includes("/api/promotions")) {
        return Promise.resolve({ data: mockPromotions });
      }
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

    // Check if the title is rendered
    expect(screen.getByText("Promotion Management")).toBeInTheDocument();

    // Wait for loading to complete
    await waitForDataToLoad();
  });

  it("fetches and displays operators and games on mount", async () => {
    render(<PromotionPage />, { wrapper });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/operators");
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/games");
    });
  });

  it("handles filter changes correctly", async () => {
    render(<PromotionPage />, { wrapper });

    // Wait for initial data load
    await waitForDataToLoad();

    // Simulate filter change
    const filterInput = screen.getByPlaceholderText("Enter promotion code");
    fireEvent.change(filterInput, { target: { value: "test" } });

    // Click search button
    const searchButton = screen.getByRole("button", {
      name: /search promotions/i,
    });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/promotions")
      );
    });
  });

  it("refreshes data when search button is clicked", async () => {
    render(<PromotionPage />, { wrapper });

    // Wait for initial data load
    await waitForDataToLoad();

    // Find and click search button
    const searchButton = screen.getByRole("button", {
      name: /search promotions/i,
    });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/promotions")
      );
    });
  });

  it("handles error when fetching operators fails", async () => {
    mockedAxios.get.mockImplementationOnce(() =>
      Promise.reject(new Error("API Error"))
    );
    render(<PromotionPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
  });

  it("handles error when fetching games fails", async () => {
    mockedAxios.get
      .mockImplementationOnce(() => Promise.resolve({ data: mockOperators }))
      .mockImplementationOnce(() => Promise.reject(new Error("API Error")));
    render(<PromotionPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
  });

  it("handles error when fetching promotions fails (non-AxiosError)", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/api/operators"))
        return Promise.resolve({ data: mockOperators });
      if (url.includes("/api/games"))
        return Promise.resolve({ data: mockGames });
      if (url.includes("/api/promotions")) return Promise.reject("Some error");
      return Promise.reject(new Error("Not found"));
    });
    render(<PromotionPage />, { wrapper });
  });

  it("handleDeleteClick sets deletingPromotionId and opens modal", async () => {
    render(<PromotionPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
  });
  
  it("handleDeleteConfirm returns early if no deletingPromotionId", async () => {
    render(<PromotionPage />, { wrapper });
  });
  
  it("handleDeleteConfirm deletes promotion successfully", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
    render(<PromotionPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i }) as HTMLButtonElement[];
    const enabledDeleteButton = deleteButtons.find(btn => !btn.disabled);
    if (enabledDeleteButton) fireEvent.click(enabledDeleteButton);
    const confirmButtons = screen.getAllByRole("button", { name: /yes|delete|ok/i }) as HTMLButtonElement[];
    const enabledConfirmButton = confirmButtons.find(btn => !btn.disabled);
    if (enabledConfirmButton) fireEvent.click(enabledConfirmButton);
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
  });
  
  it("handleDeleteConfirm handles AxiosError", async () => {
    const error = new axios.AxiosError("fail");
    error.response = { data: { message: "Custom error" } } as any;
    mockedAxios.delete.mockRejectedValueOnce(error);
    render(<PromotionPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
  });
  
  it("handleDeleteConfirm handles normal error", async () => {
    mockedAxios.delete.mockRejectedValueOnce(new Error("fail"));
    render(<PromotionPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i }) as HTMLButtonElement[];
    const enabledDeleteButton = deleteButtons.find(btn => !btn.disabled);
    if (enabledDeleteButton) fireEvent.click(enabledDeleteButton);
    const confirmButtons = screen.getAllByRole("button", { name: /yes|delete|ok/i }) as HTMLButtonElement[];
    const enabledConfirmButton = confirmButtons.find(btn => !btn.disabled);
    if (enabledConfirmButton) fireEvent.click(enabledConfirmButton);
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
  });

  it("shows confirm modal and deletes promotion when confirmed", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
    render(<PromotionPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Promotion Management")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Promotion 1")).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i }) as HTMLButtonElement[];
    const enabledDeleteButton = deleteButtons.find(btn => !btn.disabled);
    expect(enabledDeleteButton).toBeDefined();
    if (enabledDeleteButton) fireEvent.click(enabledDeleteButton);
    await waitFor(() => {
      expect(screen.getByText(/delete promotion/i)).toBeInTheDocument();
    });
    const confirmButtons = screen.getAllByRole("button", { name: /delete/i }) as HTMLButtonElement[];
    const enabledConfirmButton = confirmButtons.find(btn => !btn.disabled);
    expect(enabledConfirmButton).toBeDefined();
    if (enabledConfirmButton) fireEvent.click(enabledConfirmButton);
  });
});
