import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayerFilter from "@/app/promotion/performance/[id]/players/PlayerFilter";
import { PlayerPromotionFilters } from "@/types/performance-report";
import { PLAYER_STATUS_OPTIONS } from "@/constants/promotionStatusMap";

// Mock child components
jest.mock("@/app/promotion/performance/[id]/players/CurrencyMultiselect", () => ({
  __esModule: true,
  default: ({ 
    currencyOptions, 
    isLoading, 
    error, 
    selectedCurrencies, 
    onSelectionChange, 
    placeholder 
  }: any) => (
    <div data-testid="currency-multiselect">
      <div data-testid="currency-options">{JSON.stringify(currencyOptions)}</div>
      <div data-testid="currency-loading">{isLoading.toString()}</div>
      <div data-testid="currency-error">{error.toString()}</div>
      <div data-testid="currency-selected">{JSON.stringify(selectedCurrencies)}</div>
      <div data-testid="currency-placeholder">{placeholder}</div>
      <button 
        data-testid="currency-change"
        onClick={() => onSelectionChange(["USD", "EUR"])}
      >
        Change Currencies
      </button>
    </div>
  ),
}));

jest.mock("@/components/ui/date-range", () => ({
  __esModule: true,
  default: ({ 
    startDate, 
    endDate, 
    onDateChange, 
    minDate, 
    maxDate 
  }: any) => (
    <div data-testid="date-range">
      <div data-testid="date-start">{startDate}</div>
      <div data-testid="date-end">{endDate}</div>
      <div data-testid="date-min">{minDate}</div>
      <div data-testid="date-max">{maxDate}</div>
      <button 
        data-testid="date-change"
        onClick={() => onDateChange("2024-01-01", "2024-01-31")}
      >
        Change Date Range
      </button>
    </div>
  ),
}));

// Mock hooks
jest.mock("@/hooks/useCurrencies", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock constants
jest.mock("@/constants/promotionStatusMap", () => ({
  PLAYER_STATUS_OPTIONS: [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ],
}));

// Mock types
jest.mock("@/types/currencies", () => ({
  Currency: {},
}));

jest.mock("@/types/global", () => ({
  MultiSelectOption: {},
}));

import useCurrencies from "@/hooks/useCurrencies";

const mockCurrencies = [
  { Name: "USD", Code: "USD" },
  { Name: "EUR", Code: "EUR" },
  { Name: "GBP", Code: "GBP" },
];

const defaultFilters: PlayerPromotionFilters = {
  searchPlayer: "",
  playerStatus: "",
  startDate: "",
  endDate: "",
  currencies: [],
};

const defaultProps = {
  filters: defaultFilters,
  onFilterChange: jest.fn(),
  promotionStartDate: "2024-01-01",
  promotionEndDate: "2024-01-31",
};

describe("PlayerFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCurrencies as jest.Mock).mockReturnValue({
      data: mockCurrencies,
      isLoading: false,
      error: false,
    });
  });

  it("renders with required props", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByTestId("currency-multiselect")).toBeInTheDocument();
    expect(screen.getByTestId("date-range")).toBeInTheDocument();
  });

  it("renders search input with correct placeholder", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Player ID or Username");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });

  it("renders player status select with correct options", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    const statusSelect = screen.getByDisplayValue("All Status");
    expect(statusSelect).toBeInTheDocument();
    
    PLAYER_STATUS_OPTIONS.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("renders date range component with correct props", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    expect(screen.getByTestId("date-start")).toHaveTextContent("");
    expect(screen.getByTestId("date-end")).toHaveTextContent("");
    expect(screen.getByTestId("date-min")).toHaveTextContent("2024-01-01");
    expect(screen.getByTestId("date-max")).toHaveTextContent("2024-01-31");
  });

  it("renders currency multiselect with correct props", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    expect(screen.getByTestId("currency-multiselect")).toBeInTheDocument();
    expect(screen.getByTestId("currency-loading")).toHaveTextContent("false");
    expect(screen.getByTestId("currency-error")).toHaveTextContent("false");
    expect(screen.getByTestId("currency-selected")).toHaveTextContent("[]");
  });

  it("transforms currencies to MultiSelectOption format", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    const currencyOptions = JSON.parse(screen.getByTestId("currency-options").textContent || "[]");
    expect(currencyOptions).toHaveLength(3);
    expect(currencyOptions[0]).toEqual({
      value: "USD",
      label: "USD",
      Name: "USD",
      Code: "USD",
    });
  });

  it("removes duplicate currencies", () => {
    const duplicateCurrencies = [
      { Name: "USD", Code: "USD" },
      { Name: "USD", Code: "USD" }, // Duplicate
      { Name: "EUR", Code: "EUR" },
    ];
    
    (useCurrencies as jest.Mock).mockReturnValue({
      data: duplicateCurrencies,
      isLoading: false,
      error: false,
    });

    render(<PlayerFilter {...defaultProps} />);
    
    const currencyOptions = JSON.parse(screen.getByTestId("currency-options").textContent || "[]");
    expect(currencyOptions).toHaveLength(2); // Should remove duplicate
  });

  it("handles search player input changes", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    render(<PlayerFilter {...defaultProps} onFilterChange={mockOnFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Player ID or Username");
    await user.type(searchInput, "testuser");
    
    // Check that the final call has the complete string
    const calls = mockOnFilterChange.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBe("searchPlayer");
    // The last character typed should be 'r' from 'testuser'
    expect(lastCall[1]).toBe("r");
  });

  it("handles player status select changes", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    render(<PlayerFilter {...defaultProps} onFilterChange={mockOnFilterChange} />);
    
    const statusSelect = screen.getByDisplayValue("All Status");
    await user.selectOptions(statusSelect, "Active");
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("playerStatus", "Active");
  });

  it("handles date range changes", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    render(<PlayerFilter {...defaultProps} onFilterChange={mockOnFilterChange} />);
    
    const dateChangeButton = screen.getByTestId("date-change");
    await user.click(dateChangeButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("startDate", "2024-01-01");
    expect(mockOnFilterChange).toHaveBeenCalledWith("endDate", "2024-01-31");
  });

  it("handles currency selection changes", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    render(<PlayerFilter {...defaultProps} onFilterChange={mockOnFilterChange} />);
    
    const currencyChangeButton = screen.getByTestId("currency-change");
    await user.click(currencyChangeButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("currencies", ["USD", "EUR"]);
  });

  it("handles clear filters functionality", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    const filtersWithData: PlayerPromotionFilters = {
      searchPlayer: "testuser",
      playerStatus: "Active",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      currencies: ["USD", "EUR"],
    };
    
    render(
      <PlayerFilter 
        {...defaultProps} 
        filters={filtersWithData}
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const clearButton = screen.getByText("Clear Filters");
    await user.click(clearButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("searchPlayer", "");
    expect(mockOnFilterChange).toHaveBeenCalledWith("playerStatus", "");
    expect(mockOnFilterChange).toHaveBeenCalledWith("startDate", "");
    expect(mockOnFilterChange).toHaveBeenCalledWith("endDate", "");
    expect(mockOnFilterChange).toHaveBeenCalledWith("currencies", ["USD", "EUR", "GBP"]);
  });

  it("displays current filter values", () => {
    const filtersWithData: PlayerPromotionFilters = {
      searchPlayer: "testuser",
      playerStatus: "Active",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      currencies: ["USD", "EUR"],
    };
    
    render(<PlayerFilter {...defaultProps} filters={filtersWithData} />);
    
    expect(screen.getByDisplayValue("testuser")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Active")).toBeInTheDocument();
    expect(screen.getByTestId("date-start")).toHaveTextContent("2024-01-01");
    expect(screen.getByTestId("date-end")).toHaveTextContent("2024-01-31");
    expect(screen.getByTestId("currency-selected")).toHaveTextContent(JSON.stringify(["USD", "EUR"]));
  });

  it("handles loading state for currencies", () => {
    (useCurrencies as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: false,
    });

    render(<PlayerFilter {...defaultProps} />);
    
    expect(screen.getByTestId("currency-loading")).toHaveTextContent("true");
  });

  it("handles error state for currencies", () => {
    (useCurrencies as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: true,
    });

    render(<PlayerFilter {...defaultProps} />);
    
    expect(screen.getByTestId("currency-error")).toHaveTextContent("true");
  });

  it("handles undefined currencies data", () => {
    (useCurrencies as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: false,
    });

    render(<PlayerFilter {...defaultProps} />);
    
    expect(screen.getByTestId("currency-options")).toHaveTextContent("[]");
  });

  it("handles empty currencies data", () => {
    (useCurrencies as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: false,
    });

    render(<PlayerFilter {...defaultProps} />);
    
    expect(screen.getByTestId("currency-options")).toHaveTextContent("[]");
  });

  it("renders with correct layout structure", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    // Check that key elements are present
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search by Player ID or Username")).toBeInTheDocument();
    expect(screen.getByText("Clear Filters")).toBeInTheDocument();
  });

  it("renders clear filters button with correct styling", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    const clearButton = screen.getByText("Clear Filters");
    expect(clearButton).toHaveClass(
      "flex", "items-center", "gap-2", "px-3", "py-1.5", 
      "text-sm", "text-gray-600", "hover:text-gray-900", 
      "hover:bg-gray-100", "rounded-md", "transition-colors"
    );
  });

  it("renders search input with correct styling", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Player ID or Username");
    expect(searchInput).toHaveClass(
      "w-full", "pl-10", "pr-4", "py-2", "border", "border-gray-300", 
      "rounded-lg", "focus:ring-2", "focus:ring-blue-500", 
      "focus:border-transparent", "h-[42px]", "text-sm"
    );
  });

  it("renders status select with correct styling", () => {
    render(<PlayerFilter {...defaultProps} />);
    
    const statusSelect = screen.getByDisplayValue("All Status");
    expect(statusSelect).toHaveClass(
      "w-full", "px-4", "py-2", "border", "border-gray-300", 
      "rounded-lg", "focus:ring-2", "focus:ring-blue-500", 
      "focus:border-transparent", "h-[42px]"
    );
  });

  it("handles promotion date props correctly", () => {
    render(
      <PlayerFilter 
        {...defaultProps} 
        promotionStartDate="2024-02-01"
        promotionEndDate="2024-02-28"
      />
    );
    
    expect(screen.getByTestId("date-min")).toHaveTextContent("2024-02-01");
    expect(screen.getByTestId("date-max")).toHaveTextContent("2024-02-28");
  });

  it("handles undefined promotion dates", () => {
    render(
      <PlayerFilter 
        {...defaultProps} 
        promotionStartDate={undefined}
        promotionEndDate={undefined}
      />
    );
    
    expect(screen.getByTestId("date-min")).toHaveTextContent("");
    expect(screen.getByTestId("date-max")).toHaveTextContent("");
  });
});
