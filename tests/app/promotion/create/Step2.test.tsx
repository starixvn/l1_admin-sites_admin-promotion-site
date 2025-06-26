import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Step2 from "@/app/promotion/create/Step2";
import {
  useForm,
  Control,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { PromotionFormValues } from "@/app/promotion/create/PromotionForm";
import { Game } from "@/types/game";
import { CurrencyGroup } from "@/types/currency-group";
import { GAME_TYPES } from "@/constants/gameTypes";

// Mock child components
jest.mock("@/app/promotion/create/BetSettingsDialog", () => ({
  __esModule: true,
  default: ({ open, onClose, onSave }: any) =>
    open ? (
      <div data-testid="bet-settings-dialog">
        <button
          onClick={() => onSave({ currencyGroups: ["USD"], betLevels: [] })}
        >
          Save Settings
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock("@/app/promotion/create/PlayerFileUploader", () => ({
  __esModule: true,
  default: ({ onValidFile }: any) => (
    <div data-testid="player-file-uploader">
      <button
        onClick={() =>
          onValidFile(new File([], "test.csv"), [{ PlayerID: "123" }])
        }
      >
        Upload File
      </button>
    </div>
  ),
}));

jest.mock("@/app/promotion/create/PlayerListModal", () => ({
  __esModule: true,
  PlayerListModal: ({ showPlayerList, setShowPlayerList }: any) =>
    showPlayerList ? (
      <div data-testid="player-list-modal">
        <button onClick={() => setShowPlayerList(false)}>Close Modal</button>
      </div>
    ) : null,
}));

interface TestWrapperProps {
  children: (props: {
    control: Control<PromotionFormValues>;
    setValue: UseFormSetValue<PromotionFormValues>;
    errors: FieldErrors<PromotionFormValues>;
  }) => React.ReactNode;
  defaultValues?: Partial<PromotionFormValues>;
}

// Test wrapper component to provide form context
const TestWrapper = ({ children, defaultValues = {} }: TestWrapperProps) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    defaultValues: {
      gameIds: [],
      operatorId: "1",
      gameConfigType: GAME_TYPES.CLASSIC,
      allPlayers: true,
      offeredPlayerIds: [],
      currencyGroups: [],
      betLevels: [],
      claimExpirationDate: new Date("2025-05-14T08:04:27.000Z"),
      isGiftCode: false,
      minTurnoverMultiplier: 2,
      ...defaultValues,
    },
  });

  return children({ control, setValue, errors });
};

describe("Step2 Component", () => {
  const mockGames: Game[] = [
    { GameId: 1, DisplayName: "Game 1", Type: GAME_TYPES.CLASSIC },
    { GameId: 2, DisplayName: "Game 2", Type: GAME_TYPES.CLASSIC },
  ];

  const mockCurrencyGroups: CurrencyGroup[] = [
    { Id: "1", Name: "USD" },
    { Id: "2", Name: "EUR" },
  ];

  const defaultProps = {
    mode: "create",
    status: "draft",
    openBetSettings: false,
    setOpenBetSettings: jest.fn(),
    siteInput: "",
    setSiteInput: jest.fn(),
    games: mockGames,
    currencyGroupsInfo: mockCurrencyGroups,
    isLoadingCurrencyGroups: false,
    isLoading: false,
    error: null,
    toggleGame: jest.fn(),
    operators: [{ PartnerId: "op1", Name: "Operator 1" }],
  };

  it("renders all main sections", () => {
    render(
      <TestWrapper>
        {({ control, setValue, errors }) => (
          <Step2
            {...defaultProps}
            control={control}
            setValue={setValue}
            errors={errors}
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText("⚙️ Configuration")).toBeInTheDocument();
    expect(screen.getByText("🎮 Game Selection")).toBeInTheDocument();
    expect(screen.getByText("👥 Target Members")).toBeInTheDocument();
  });

  it("handles game selection correctly", async () => {
    const mockSetValue = jest.fn();
    render(
      <TestWrapper
        defaultValues={{
          currencyGroups: ["USD"],
          gameConfigType: GAME_TYPES.CLASSIC,
        }}
      >
        {({ control, setValue, errors }) => (
          <Step2
            {...defaultProps}
            control={control}
            setValue={mockSetValue}
            errors={errors}
          />
        )}
      </TestWrapper>
    );

    const gameRadios = screen.getAllByRole("radio");
    await userEvent.click(gameRadios[0]); // Click first game radio

    expect(mockSetValue).toHaveBeenCalledWith("gameIds", [1]);
  });

  it("handles target members selection correctly", async () => {
    render(
      <TestWrapper>
        {({ control, setValue, errors }) => (
          <Step2
            {...defaultProps}
            control={control}
            setValue={setValue}
            errors={errors}
          />
        )}
      </TestWrapper>
    );

    const fileRadio = screen.getByLabelText("Players from File");
    await userEvent.click(fileRadio);

    expect(screen.getByTestId("player-file-uploader")).toBeInTheDocument();
  });

  it("opens bet settings dialog when edit button is clicked", async () => {
    render(
      <TestWrapper>
        {({ control, setValue, errors }) => (
          <Step2
            {...defaultProps}
            control={control}
            setValue={setValue}
            errors={errors}
          />
        )}
      </TestWrapper>
    );

    const editButton = screen.getByLabelText("Edit Bet Settings");
    await userEvent.click(editButton);

    expect(defaultProps.setOpenBetSettings).toHaveBeenCalledWith(true);
  });

  it("shows loading states correctly", () => {
    render(
      <TestWrapper
        defaultValues={{
          currencyGroups: ["USD"],
          gameConfigType: GAME_TYPES.CLASSIC,
        }}
      >
        {({ control, setValue, errors }) => (
          <Step2
            {...defaultProps}
            control={control}
            setValue={setValue}
            errors={errors}
            isLoading={true}
            isLoadingCurrencyGroups={true}
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText("Loading Currency Groups...")).toBeInTheDocument();
    expect(screen.getByText("Loading games...")).toBeInTheDocument();
  });

  it("handles error states correctly", () => {
    const error = new Error("Failed to load games");
    render(
      <TestWrapper
        defaultValues={{
          currencyGroups: ["USD"],
          gameConfigType: GAME_TYPES.CLASSIC,
        }}
      >
        {({ control, setValue, errors }) => (
          <Step2
            {...defaultProps}
            control={control}
            setValue={setValue}
            errors={errors}
            error={error}
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText("Failed to load games")).toBeInTheDocument();
  });
});
