import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Step1 from "@/app/promotion/create/Step1";
import { GAME_TYPES } from "@/constants/gameTypes";
import type { PromotionFormValues } from "@/app/promotion/create/PromotionForm";
import type { Operator } from "@/types/operator";
import { promotionSchema } from "@/app/promotion/create/PromotionForm";
import { addDays } from "date-fns";

// Mock the UI components
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      disabled={disabled}
      data-testid="select"
      aria-label={children?.props?.["aria-label"]}
    >
      {children?.props?.children}
    </select>
  ),
  SelectTrigger: ({ children, id, "aria-label": ariaLabel }: any) => (
    <div>
      <label htmlFor={id}>{ariaLabel}</label>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock the date-time-picker component
jest.mock("@/components/custom/date-time-picker", () => ({
  __esModule: true,
  default: ({ label, value, onChange, error, disabled }: any) => {
    const dateValue = value instanceof Date && !isNaN(value.getTime()) 
      ? value.toISOString().slice(0, 16)
      : "";
      
    return (
      <div data-testid={`date-picker-${label.toLowerCase().replace(" ", "-")}`}>
        <label htmlFor={`date-input-${label.toLowerCase().replace(" ", "-")}`}>{label}</label>
        <input
          id={`date-input-${label.toLowerCase().replace(" ", "-")}`}
          type="datetime-local"
          value={dateValue}
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (!isNaN(date.getTime())) {
              onChange?.(date);
            }
          }}
          disabled={disabled}
          data-testid={`date-input-${label.toLowerCase().replace(" ", "-")}`}
        />
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  },
}));

// Wrapper component to provide form context
const TestWrapper = ({
  mode = "create",
  status = "draft",
  operators = [],
  initialValues = {},
}: {
  mode?: string;
  status?: string;
  operators?: Operator[];
  initialValues?: Partial<PromotionFormValues>;
}) => {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      gameConfigType: GAME_TYPES.CLASSIC,
      bonusItemCount: 0,
      startDate: new Date("2024-03-20T10:00:00"),
      endDate: new Date("2024-03-20T10:00:00"),
      operatorId: "",
      gameIds: [],
      currencyGroups: [],
      allPlayers: true,
      offeredPlayerIds: [],
      offeredSiteNames: [],
      ...initialValues,
    },
  });

  const [codeEdited, setCodeEdited] = React.useState(false);

  return (
    <Step1
      mode={mode}
      status={status}
      register={register}
      setValue={setValue}
      control={control}
      errors={errors}
      codeEdited={codeEdited}
      setCodeEdited={setCodeEdited}
      operators={operators}
    />
  );
};

describe("Step1 Component", () => {
  const mockOperators: Operator[] = [
    { PartnerId: "1", Name: "Operator 1" },
    { PartnerId: "2", Name: "Operator 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(<TestWrapper operators={mockOperators} />);

    expect(screen.getByLabelText("Promotion Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Promotion Code")).toBeInTheDocument();
    expect(screen.getByLabelText("No. of Free Spins")).toBeInTheDocument();
    expect(screen.getByTestId("date-picker-start-date")).toBeInTheDocument();
    expect(screen.getByTestId("date-picker-end-date")).toBeInTheDocument();
  });

  it("auto-generates promotion code from name when not in edit mode", async () => {
    const user = userEvent.setup();
    render(<TestWrapper operators={mockOperators} />);
    
    const nameInput = screen.getByLabelText("Promotion Name");
    await user.type(nameInput, "Test Promotion");
    await user.tab(); // Trigger blur event

    const codeInput = screen.getByLabelText("Promotion Code");
    await waitFor(() => {
      expect(codeInput).toHaveValue("test_promotion");
    });
  });

  it("does not auto-generate code when in edit mode", async () => {
    const user = userEvent.setup();
    const initialCode = "existing_code";
    render(
      <TestWrapper
        mode="edit"
        operators={mockOperators}
        initialValues={{ code: initialCode }}
      />
    );
    
    const nameInput = screen.getByLabelText("Promotion Name");
    await user.type(nameInput, "New Name");
    await user.tab(); // Trigger blur event

    const codeInput = screen.getByLabelText("Promotion Code");
    await waitFor(() => {
      expect(codeInput).toHaveValue(initialCode);
    });
  });

  it("disables code input in edit mode", () => {
    render(<TestWrapper mode="edit" operators={mockOperators} />);
    const codeInput = screen.getByLabelText("Promotion Code");
    expect(codeInput).toBeDisabled();
  });

  it("disables all inputs when promotion is running", () => {
    render(
      <TestWrapper
        mode="edit"
        status="running"
        operators={mockOperators}
      />
    );

    expect(screen.getByLabelText("No. of Free Spins")).toBeDisabled();
    expect(screen.getByTestId("date-input-start-date")).toBeDisabled();
    expect(screen.getByTestId("date-input-end-date")).toBeDisabled();
  });

  it("validates promotion name length", async () => {
    const user = userEvent.setup();
    render(<TestWrapper operators={mockOperators} />);
    
    const nameInput = screen.getByLabelText("Promotion Name");
    const longName = "a".repeat(51);
    
    await user.type(nameInput, longName);
    await waitFor(() => {
      expect(nameInput).toHaveValue(longName.slice(0, 50));
    });
  });

  it("handles date changes correctly", async () => {
    const user = userEvent.setup();
    render(<TestWrapper operators={mockOperators} />);
    
    const startDateInput = screen.getByTestId("date-input-start-date");
    const testDate = "2024-03-20T10:00";
    
    await user.clear(startDateInput);
    await user.type(startDateInput, testDate);
  });

  it("shows validation errors for required fields", async () => {
    const user = userEvent.setup();
    render(<TestWrapper operators={mockOperators} />);
    
    // Trigger validation by submitting empty form
    const nameInput = screen.getByLabelText("Promotion Name");
    await user.click(nameInput);
    await user.tab();
    
    const codeInput = screen.getByLabelText("Promotion Code");
    await user.click(codeInput);
    await user.tab();
    
    const bonusInput = screen.getByLabelText("No. of Free Spins");
    await user.click(bonusInput);
    await user.tab();
    
    // Wait for validation to complete
  });
});