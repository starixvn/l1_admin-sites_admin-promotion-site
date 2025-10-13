import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrencyMultiSelect from "@/app/promotion/performance/[id]/players/CurrencyMultiselect";
import { MultiSelectOption } from "@/types/global";

// Mock MultiSelect component
jest.mock("@/components/ui/multi-select", () => ({
  __esModule: true,
  default: ({ 
    options, 
    selectedValues, 
    onSelectionChange, 
    placeholder, 
    className, 
    searchPlaceholder, 
    selectAllText, 
    clearAllText, 
    selectedText, 
    noOptionsText, 
    loadingText, 
    errorText, 
    isLoading, 
    error, 
    maxDisplayItems, 
    defaultSelectAll, 
    searchable 
  }: any) => (
    <div data-testid="multi-select" className={className}>
      <div data-testid="multi-select-options">{JSON.stringify(options)}</div>
      <div data-testid="multi-select-selected">{JSON.stringify(selectedValues)}</div>
      <div data-testid="multi-select-placeholder">{placeholder}</div>
      <div data-testid="multi-select-search-placeholder">{searchPlaceholder}</div>
      <div data-testid="multi-select-select-all">{selectAllText}</div>
      <div data-testid="multi-select-clear-all">{clearAllText}</div>
      <div data-testid="multi-select-selected-text">{selectedText}</div>
      <div data-testid="multi-select-no-options">{noOptionsText}</div>
      <div data-testid="multi-select-loading">{loadingText}</div>
      <div data-testid="multi-select-error">{errorText}</div>
      <div data-testid="multi-select-loading-state">{isLoading.toString()}</div>
      <div data-testid="multi-select-error-state">{error.toString()}</div>
      <div data-testid="multi-select-max-display">{maxDisplayItems}</div>
      <div data-testid="multi-select-default-select-all">{defaultSelectAll.toString()}</div>
      <div data-testid="multi-select-searchable">{searchable.toString()}</div>
      <button 
        data-testid="multi-select-change"
        onClick={() => onSelectionChange(["USD", "EUR"])}
      >
        Change Selection
      </button>
    </div>
  ),
}));

describe("CurrencyMultiSelect", () => {
  const mockCurrencyOptions: MultiSelectOption[] = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
  ];

  const defaultProps = {
    currencyOptions: mockCurrencyOptions,
    isLoading: false,
    error: false,
    selectedCurrencies: ["USD"],
    onSelectionChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with required props", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select")).toBeInTheDocument();
    expect(screen.getByTestId("multi-select-options")).toHaveTextContent(JSON.stringify(mockCurrencyOptions));
    expect(screen.getByTestId("multi-select-selected")).toHaveTextContent(JSON.stringify(["USD"]));
  });

  it("uses default placeholder when not provided", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-placeholder")).toHaveTextContent("Select currencies...");
  });

  it("uses custom placeholder when provided", () => {
    render(<CurrencyMultiSelect {...defaultProps} placeholder="Choose currencies" />);
    
    expect(screen.getByTestId("multi-select-placeholder")).toHaveTextContent("Choose currencies");
  });

  it("uses default className when not provided", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    const multiSelect = screen.getByTestId("multi-select");
    expect(multiSelect).toBeInTheDocument();
    // When no className is provided, the element should not have any specific classes
    expect(multiSelect.className).toBe("");
  });

  it("uses custom className when provided", () => {
    render(<CurrencyMultiSelect {...defaultProps} className="custom-class" />);
    
    expect(screen.getByTestId("multi-select")).toHaveClass("custom-class");
  });

  it("passes correct search placeholder", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-search-placeholder")).toHaveTextContent("Search currencies...");
  });

  it("passes correct select all text", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-select-all")).toHaveTextContent("Select All");
  });

  it("passes correct clear all text", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-clear-all")).toHaveTextContent("Clear all");
  });

  it("passes correct selected text", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-selected-text")).toHaveTextContent("selected");
  });

  it("passes correct no options text", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-no-options")).toHaveTextContent("No currencies found");
  });

  it("passes correct loading text", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-loading")).toHaveTextContent("Loading...");
  });

  it("passes correct error text", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-error")).toHaveTextContent("Error loading currencies");
  });

  it("passes loading state correctly", () => {
    render(<CurrencyMultiSelect {...defaultProps} isLoading={true} />);
    
    expect(screen.getByTestId("multi-select-loading-state")).toHaveTextContent("true");
  });

  it("passes error state correctly", () => {
    render(<CurrencyMultiSelect {...defaultProps} error={true} />);
    
    expect(screen.getByTestId("multi-select-error-state")).toHaveTextContent("true");
  });

  it("passes max display items", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-max-display")).toHaveTextContent("5");
  });

  it("enables default select all", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-default-select-all")).toHaveTextContent("true");
  });

  it("enables searchable functionality", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    expect(screen.getByTestId("multi-select-searchable")).toHaveTextContent("true");
  });

  it("calls onSelectionChange when selection changes", async () => {
    const user = userEvent.setup();
    const mockOnSelectionChange = jest.fn();
    
    render(<CurrencyMultiSelect {...defaultProps} onSelectionChange={mockOnSelectionChange} />);
    
    const changeButton = screen.getByTestId("multi-select-change");
    await user.click(changeButton);
    
    expect(mockOnSelectionChange).toHaveBeenCalledWith(["USD", "EUR"]);
  });

  it("handles empty currency options", () => {
    render(<CurrencyMultiSelect {...defaultProps} currencyOptions={[]} />);
    
    expect(screen.getByTestId("multi-select-options")).toHaveTextContent("[]");
  });

  it("handles empty selected currencies", () => {
    render(<CurrencyMultiSelect {...defaultProps} selectedCurrencies={[]} />);
    
    expect(screen.getByTestId("multi-select-selected")).toHaveTextContent("[]");
  });

  it("handles multiple selected currencies", () => {
    const multipleSelected = ["USD", "EUR", "GBP"];
    render(<CurrencyMultiSelect {...defaultProps} selectedCurrencies={multipleSelected} />);
    
    expect(screen.getByTestId("multi-select-selected")).toHaveTextContent(JSON.stringify(multipleSelected));
  });

  it("handles loading state", () => {
    render(<CurrencyMultiSelect {...defaultProps} isLoading={true} />);
    
    expect(screen.getByTestId("multi-select-loading-state")).toHaveTextContent("true");
  });

  it("handles error state", () => {
    render(<CurrencyMultiSelect {...defaultProps} error={true} />);
    
    expect(screen.getByTestId("multi-select-error-state")).toHaveTextContent("true");
  });

  it("passes all props to MultiSelect component", () => {
    const customProps = {
      ...defaultProps,
      placeholder: "Custom placeholder",
      className: "custom-class",
      isLoading: true,
      error: true,
      selectedCurrencies: ["USD", "EUR"],
    };
    
    render(<CurrencyMultiSelect {...customProps} />);
    
    expect(screen.getByTestId("multi-select")).toHaveClass("custom-class");
    expect(screen.getByTestId("multi-select-placeholder")).toHaveTextContent("Custom placeholder");
    expect(screen.getByTestId("multi-select-loading-state")).toHaveTextContent("true");
    expect(screen.getByTestId("multi-select-error-state")).toHaveTextContent("true");
    expect(screen.getByTestId("multi-select-selected")).toHaveTextContent(JSON.stringify(["USD", "EUR"]));
  });

  it("maintains consistent configuration", () => {
    render(<CurrencyMultiSelect {...defaultProps} />);
    
    // Verify all the hardcoded configuration values
    expect(screen.getByTestId("multi-select-search-placeholder")).toHaveTextContent("Search currencies...");
    expect(screen.getByTestId("multi-select-select-all")).toHaveTextContent("Select All");
    expect(screen.getByTestId("multi-select-clear-all")).toHaveTextContent("Clear all");
    expect(screen.getByTestId("multi-select-selected-text")).toHaveTextContent("selected");
    expect(screen.getByTestId("multi-select-no-options")).toHaveTextContent("No currencies found");
    expect(screen.getByTestId("multi-select-loading")).toHaveTextContent("Loading...");
    expect(screen.getByTestId("multi-select-error")).toHaveTextContent("Error loading currencies");
    expect(screen.getByTestId("multi-select-max-display")).toHaveTextContent("5");
    expect(screen.getByTestId("multi-select-default-select-all")).toHaveTextContent("true");
    expect(screen.getByTestId("multi-select-searchable")).toHaveTextContent("true");
  });

  it("handles undefined currency options gracefully", () => {
    render(<CurrencyMultiSelect {...defaultProps} currencyOptions={undefined as any} />);
    
    expect(screen.getByTestId("multi-select")).toBeInTheDocument();
  });

  it("handles undefined selected currencies gracefully", () => {
    render(<CurrencyMultiSelect {...defaultProps} selectedCurrencies={undefined as any} />);
    
    expect(screen.getByTestId("multi-select")).toBeInTheDocument();
  });
});
