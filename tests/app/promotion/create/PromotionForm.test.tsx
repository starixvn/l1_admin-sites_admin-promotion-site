import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PromotionForm from "../../../../src/app/promotion/create/PromotionForm";
import { GAME_TYPES } from "../../../../src/constants/gameTypes";

// Mock hooks and components
jest.mock("../../../../src/hooks/useCreatePromotion", () => ({
  useCreatePromotion: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock("../../../../src/hooks/useOperators", () => ({
  useOperators: () => ({
    data: [
      { _id: "op1", name: "Operator 1" },
      { _id: "op2", name: "Operator 2" },
    ],
  }),
}));

jest.mock("../../../../src/hooks/useFilteredGames", () => ({
  useFilteredGames: () => ({
    data: [
      { _id: 1, name: "Game 1" },
      { _id: 2, name: "Game 2" },
    ],
    isLoading: false,
    error: null,
  }),
}));

jest.mock("../../../../src/lib/api/checkPromotionCodeExists", () => ({
  checkPromotionCodeExists: jest.fn().mockResolvedValue(false),
}));

jest.mock("../../../../src/app/promotion/create/Step1", () => {
  return function MockStep1({ register, errors, operators }: any) {
    return (
      <div data-testid="step1">
        <input {...register("name")} data-testid="name-input" />
        {errors.name && <span>{errors.name.message}</span>}
        <input {...register("code")} data-testid="code-input" />
        {errors.code && <span>{errors.code.message}</span>}
        <input {...register("bonusItemCount")} data-testid="bonus-input" />
        {errors.bonusItemCount && <span>{errors.bonusItemCount.message}</span>}
        <input {...register("startDate")} data-testid="start-date-input" />
        {errors.startDate && <span>{errors.startDate.message}</span>}
        <input {...register("endDate")} data-testid="end-date-input" />
        {errors.endDate && <span>{errors.endDate.message}</span>}
        <select {...register("operatorId")} data-testid="operator-select">
          <option value="">Select Operator</option>
          {operators.map((op: any) => (
            <option key={op._id} value={op._id}>
              {op.name}
            </option>
          ))}
        </select>
        {errors.operatorId && <span>{errors.operatorId.message}</span>}
      </div>
    );
  };
});

jest.mock("../../../../src/app/promotion/create/Step2", () => {
  return function MockStep2({ control, errors, games, toggleGame }: any) {
    return (
      <div data-testid="step2">
        <input {...control.register("currencyGroups")} data-testid="currency-input" />
        {errors.currencyGroups && <span>{errors.currencyGroups.message}</span>}
        <input {...control.register("gameIds")} data-testid="game-input" />
        {errors.gameIds && <span>{errors.gameIds.message}</span>}
        <div data-testid="game-list">
          {games.map((game: any) => (
            <button
              key={game._id}
              onClick={() => toggleGame(game._id)}
              data-testid={`game-${game._id}`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>
    );
  };
});

jest.mock("../../../../src/components/ConfirmDialog", () => {
  return function MockConfirmDialog({ open, onConfirm, onCancel }: any) {
    if (!open) return null;
    return (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm} data-testid="confirm-button">
          Confirm
        </button>
        <button onClick={onCancel} data-testid="cancel-button">
          Cancel
        </button>
      </div>
    );
  };
});

describe("PromotionForm", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders in create mode with default values", () => {
    render(<PromotionForm mode="create" onClose={mockOnClose} />);
    
    expect(screen.getByTestId("step1")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Basic Details")).toBeInTheDocument();
  });

  it("renders in edit mode with initial values", () => {
    const initialValues = {
      _id: "promo1",
      name: "Test Promotion",
      code: "TEST123",
      bonusItemCount: 100,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      operatorId: "op1",
      gameConfigType: GAME_TYPES.CLASSIC,
      currencyGroups: ["USD"],
      gameIds: [1],
      allPlayers: true,
    };

    render(
      <PromotionForm
        mode="edit"
        initialValues={initialValues as any}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId("name-input")).toHaveValue("Test Promotion");
    expect(screen.getByTestId("code-input")).toHaveValue("TEST123");
    expect(screen.getByTestId("bonus-input")).toHaveValue(100);
  });

  it("validates required fields in step 1", async () => {
    render(<PromotionForm mode="create" onClose={mockOnClose} />);
    
    const nextButton = screen.getByText("Next →");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Promotion name is required")).toBeInTheDocument();
      expect(screen.getByText("Promotion code is required")).toBeInTheDocument();
      expect(screen.getByText("Free spins must be greater than 0")).toBeInTheDocument();
      expect(screen.getByText("Operator is required")).toBeInTheDocument();
    });
  });

  it("moves to step 2 when step 1 is valid", async () => {
    render(<PromotionForm mode="create" onClose={mockOnClose} />);
    
    // Fill required fields
    await userEvent.type(screen.getByTestId("name-input"), "Test Promotion");
    await userEvent.type(screen.getByTestId("code-input"), "TEST123");
    await userEvent.type(screen.getByTestId("bonus-input"), "100");
    await userEvent.selectOptions(screen.getByTestId("operator-select"), "op1");
    
    const nextButton = screen.getByText("Next →");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId("step2")).toBeInTheDocument();
      expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
      expect(screen.getByText("Targeting & Settings")).toBeInTheDocument();
    });
  });

  it("shows confirm dialog in edit mode before submitting", async () => {
    const initialValues = {
      _id: "promo1",
      name: "Test Promotion",
      code: "TEST123",
      bonusItemCount: 100,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      operatorId: "op1",
      gameConfigType: GAME_TYPES.CLASSIC,
      currencyGroups: ["USD"],
      gameIds: [1],
      allPlayers: true,
    };

    render(
      <PromotionForm
        mode="edit"
        initialValues={initialValues as any}
        onClose={mockOnClose}
      />
    );

    // Move to step 2
    const nextButton = screen.getByText("Next →");
    fireEvent.click(nextButton);

    // Try to save
    const saveButton = screen.getByText("Save Promotion ✓");
    fireEvent.click(saveButton);

    // Confirm dialog should appear
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
  });

  it("submits form with correct data", async () => {
    const { useCreatePromotion } = require("../../../../src/hooks/useCreatePromotion");
    const mockMutate = jest.fn();
    useCreatePromotion.mockReturnValue({ mutate: mockMutate, isPending: false });

    render(<PromotionForm mode="create" onClose={mockOnClose} />);

    // Fill step 1
    await userEvent.type(screen.getByTestId("name-input"), "Test Promotion");
    await userEvent.type(screen.getByTestId("code-input"), "TEST123");
    await userEvent.type(screen.getByTestId("bonus-input"), "100");
    await userEvent.selectOptions(screen.getByTestId("operator-select"), "op1");

    // Move to step 2
    const nextButton = screen.getByText("Next →");
    fireEvent.click(nextButton);

    // Fill step 2
    await userEvent.type(screen.getByTestId("currency-input"), "USD");
    fireEvent.click(screen.getByTestId("game-1"));

    // Submit form
    const saveButton = screen.getByText("Save Promotion ✓");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Promotion",
          code: "TEST123",
          bonusItemCount: 100,
          operatorId: "op1",
          currencyGroups: ["USD"],
          gameIds: [1],
        }),
        expect.any(Object)
      );
    });
  });

  it("handles custom onSubmit when provided", async () => {
    render(
      <PromotionForm
        mode="create"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill and submit form
    await userEvent.type(screen.getByTestId("name-input"), "Test Promotion");
    await userEvent.type(screen.getByTestId("code-input"), "TEST123");
    await userEvent.type(screen.getByTestId("bonus-input"), "100");
    await userEvent.selectOptions(screen.getByTestId("operator-select"), "op1");

    const nextButton = screen.getByText("Next →");
    fireEvent.click(nextButton);

    await userEvent.type(screen.getByTestId("currency-input"), "USD");
    fireEvent.click(screen.getByTestId("game-1"));

    const saveButton = screen.getByText("Save Promotion ✓");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it("validates promotion code uniqueness in create mode", async () => {
    const { checkPromotionCodeExists } = require("../../../../src/lib/api/checkPromotionCodeExists");
    checkPromotionCodeExists.mockResolvedValueOnce(true);

    render(<PromotionForm mode="create" onClose={mockOnClose} />);

    // Fill other required fields
    await userEvent.type(screen.getByTestId("name-input"), "Test Promotion");
    await userEvent.type(screen.getByTestId("bonus-input"), "100");
    await userEvent.selectOptions(screen.getByTestId("operator-select"), "op1");

    // Enter existing code
    await userEvent.type(screen.getByTestId("code-input"), "EXISTING");

    const nextButton = screen.getByText("Next →");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("This promotion code already exists. Please choose another.")).toBeInTheDocument();
    });
  });
});
