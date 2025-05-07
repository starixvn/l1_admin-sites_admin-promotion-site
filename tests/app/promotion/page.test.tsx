import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PromotionPage from "../../../src/app/promotion/page";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    status: "Running",
    operatorId: "op1",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  },
  {
    _id: "2",
    name: "Promotion 2",
    status: "Running",
    operatorId: "op2",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  },
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
    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch promotions")
      ).toBeInTheDocument();
    });
  });
});
