import React from "react";
import { render, screen, act } from "@testing-library/react";
import PromotionForm from "@/app/promotion/create/PromotionForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GAME_TYPES } from "@/constants/gameTypes";

// Mock hooks
jest.mock("@/hooks/useOperators", () => ({
  useOperators: () => ({
    data: [
      { PartnerId: "op1", Name: "Operator 1" },
      { PartnerId: "op2", Name: "Operator 2" },
    ],
  }),
}));

jest.mock("@/hooks/useCurrencyGroups", () => ({
  useCurrencyGroups: () => ({
    data: [
      { Id: "cg1", Name: "USD" },
      { Id: "cg2", Name: "VND" },
    ],
    isLoading: false,
  }),
}));

jest.mock("@/hooks/useFilteredGames", () => ({
  useFilteredGames: () => ({
    data: [
      { GameId: 1, Name: "Game 1" },
      { GameId: 2, Name: "Game 2" },
    ],
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/hooks/useCreatePromotion", () => ({
  useCreatePromotion: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock("@/lib/api/checkPromotionCodeExists", () => ({
  checkPromotionCodeExists: jest.fn().mockResolvedValue(false),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderForm = (props = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <PromotionForm {...props} />
    </QueryClientProvider>
  );
};

describe("PromotionForm", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("renders in create mode with default values", async () => {
    renderForm();

    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Basic Details")).toBeInTheDocument();
  });

  it("renders in edit mode with initial values", async () => {
    const initialValues = {
      _id: "promo1",
      name: "Test Promotion",
      code: "TEST123",
      bonusItemCount: 10,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      operatorId: "op1",
      gameConfigType: GAME_TYPES.CLASSIC,
      gameIds: [1, 2],
      currencyGroups: ["cg1"],
      betLevels: [{ currencyGroup: "cg1", betLevel: 10 }],
      offeredSiteNames: [],
      offeredPlayerIds: [],
    };

    renderForm({ mode: "edit", initialValues });

    expect(screen.getByDisplayValue("Test Promotion")).toBeInTheDocument();
    expect(screen.getByDisplayValue("TEST123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
  });

  it("validates required fields in step 1", async () => {
    renderForm();

    const nextButton = screen.getByText("Next →");
    await act(async () => {
      nextButton.click();
    });

    expect(screen.getByText("Promotion name is required")).toBeInTheDocument();
    expect(screen.getByText("Promotion code is required")).toBeInTheDocument();
    expect(screen.getByText("Free spins must be greater than 0")).toBeInTheDocument();
  });
});
