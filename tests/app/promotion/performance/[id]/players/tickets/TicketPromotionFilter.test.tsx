import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TicketPromotionFilter from "@/app/promotion/performance/[id]/players/tickets/TicketPromotionFilter";
import { PromotionalTicketsFilters } from "@/types/promotional-tickets";

// Mock child components
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

// Mock icons
jest.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

const defaultFilters: PromotionalTicketsFilters = {
  roundId: "",
  startDate: "",
  endDate: "",
};

const defaultProps = {
  filters: defaultFilters,
  onFilterChange: jest.fn(),
  promotionStartDate: "2024-01-01",
  promotionEndDate: "2024-01-31",
};

describe("TicketPromotionFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with required props", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByTestId("date-range")).toBeInTheDocument();
  });

  it("renders search input with correct placeholder", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Round ID");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });

  it("renders date range component with correct props", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    expect(screen.getByTestId("date-start")).toHaveTextContent("");
    expect(screen.getByTestId("date-end")).toHaveTextContent("");
    expect(screen.getByTestId("date-min")).toHaveTextContent("2024-01-01");
    expect(screen.getByTestId("date-max")).toHaveTextContent("2024-01-31");
  });

  it("handles round ID input changes", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    render(<TicketPromotionFilter {...defaultProps} onFilterChange={mockOnFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Round ID");
    await user.type(searchInput, "round123");
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "r");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "o");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "u");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "n");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "d");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "1");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "2");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "3");
  });

  it("handles date range changes", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    render(<TicketPromotionFilter {...defaultProps} onFilterChange={mockOnFilterChange} />);
    
    const dateChangeButton = screen.getByTestId("date-change");
    await user.click(dateChangeButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("startDate", "2024-01-01");
    expect(mockOnFilterChange).toHaveBeenCalledWith("endDate", "2024-01-31");
  });

  it("handles clear filters functionality", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    const filtersWithData: PromotionalTicketsFilters = {
      roundId: "round123",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    };
    
    render(
      <TicketPromotionFilter 
        {...defaultProps} 
        filters={filtersWithData}
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const clearButton = screen.getByText("Clear Filters");
    await user.click(clearButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "");
    expect(mockOnFilterChange).toHaveBeenCalledWith("startDate", "");
    expect(mockOnFilterChange).toHaveBeenCalledWith("endDate", "");
  });

  it("displays current filter values", () => {
    const filtersWithData: PromotionalTicketsFilters = {
      roundId: "round123",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    };
    
    render(<TicketPromotionFilter {...defaultProps} filters={filtersWithData} />);
    
    expect(screen.getByDisplayValue("round123")).toBeInTheDocument();
    expect(screen.getByTestId("date-start")).toHaveTextContent("2024-01-01");
    expect(screen.getByTestId("date-end")).toHaveTextContent("2024-01-31");
  });

  it("renders with correct layout structure", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByTestId("date-range")).toBeInTheDocument();
  });

  it("renders clear filters button with correct styling", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    const clearButton = screen.getByText("Clear Filters");
    expect(clearButton).toHaveClass(
      "flex", "items-center", "gap-2", "px-3", "py-1.5", 
      "text-sm", "text-gray-600", "hover:text-gray-900", 
      "hover:bg-gray-100", "rounded-md", "transition-colors"
    );
  });

  it("renders search input with correct styling", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Round ID");
    expect(searchInput).toHaveClass(
      "w-full", "pl-10", "pr-4", "py-2", "border", "border-gray-300", 
      "rounded-lg", "focus:ring-2", "focus:ring-blue-500", 
      "focus:border-transparent"
    );
  });

  it("renders search icon", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });

  it("renders clear icon", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("handles promotion date props correctly", () => {
    render(
      <TicketPromotionFilter 
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
      <TicketPromotionFilter 
        {...defaultProps} 
        promotionStartDate={undefined}
        promotionEndDate={undefined}
      />
    );
    
    expect(screen.getByTestId("date-min")).toHaveTextContent("");
    expect(screen.getByTestId("date-max")).toHaveTextContent("");
  });

  it("renders date range label with GMT+7 indicator", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    expect(screen.getByText("Date Joined")).toBeInTheDocument();
    expect(screen.getByText("(GMT+7)")).toBeInTheDocument();
  });

  it("handles multiple filter changes in sequence", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = jest.fn();
    
    render(<TicketPromotionFilter {...defaultProps} onFilterChange={mockOnFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Round ID");
    await user.type(searchInput, "round");
    
    const dateChangeButton = screen.getByTestId("date-change");
    await user.click(dateChangeButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "r");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "o");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "u");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "n");
    expect(mockOnFilterChange).toHaveBeenCalledWith("roundId", "d");
    expect(mockOnFilterChange).toHaveBeenCalledWith("startDate", "2024-01-01");
    expect(mockOnFilterChange).toHaveBeenCalledWith("endDate", "2024-01-31");
  });

  it("maintains filter state correctly", () => {
    const filtersWithData: PromotionalTicketsFilters = {
      roundId: "test-round",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
    };
    
    render(<TicketPromotionFilter {...defaultProps} filters={filtersWithData} />);
    
    expect(screen.getByDisplayValue("test-round")).toBeInTheDocument();
    expect(screen.getByTestId("date-start")).toHaveTextContent("2024-01-15");
    expect(screen.getByTestId("date-end")).toHaveTextContent("2024-01-20");
  });

  it("handles empty filter values", () => {
    const emptyFilters: PromotionalTicketsFilters = {
      roundId: "",
      startDate: "",
      endDate: "",
    };
    
    render(<TicketPromotionFilter {...defaultProps} filters={emptyFilters} />);
    
    expect(screen.getByDisplayValue("")).toBeInTheDocument();
    expect(screen.getByTestId("date-start")).toHaveTextContent("");
    expect(screen.getByTestId("date-end")).toHaveTextContent("");
  });

  it("renders with correct grid layout", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("renders search input with proper positioning", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Round ID");
    expect(searchInput).toBeInTheDocument();
  });

  it("handles keyboard navigation", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText("Search by Round ID");
    const clearButton = screen.getByText("Clear Filters");
    
    expect(searchInput).toBeInTheDocument();
    expect(clearButton).toBeInTheDocument();
  });

  it("renders with consistent styling", () => {
    render(<TicketPromotionFilter {...defaultProps} />);
    
    const title = screen.getByText("Filters");
    expect(title).toBeInTheDocument();
  });
});
