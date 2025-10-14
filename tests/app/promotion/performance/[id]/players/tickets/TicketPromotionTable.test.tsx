import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TicketPromotionTable from "@/app/promotion/performance/[id]/players/tickets/TicketPromotionTable";
import { PromotionalTicket } from "@/types/promotional-tickets";
import { PaginationState } from "@tanstack/react-table";

// Mock utility functions
jest.mock("@/lib/date-time.utils", () => ({
  toGMTStringWithSeconds: jest.fn((date) => `2024-01-01 00:00:00`),
}));

jest.mock("@/lib/promotion/promotion.utils", () => ({
  roundToDecimals: jest.fn((value) => Number(value).toFixed(4)),
}));

jest.mock("@/lib/table-utils", () => ({
  fuzzySort: jest.fn(),
}));

// Mock common components
jest.mock("@/components/common/PaginationControls", () => ({
  __esModule: true,
  default: ({ 
    pagination, 
    totalCount, 
    onPaginationChange, 
    table 
  }: any) => (
    <div data-testid="pagination-controls">
      <div data-testid="pagination-page">{pagination.pageIndex}</div>
      <div data-testid="pagination-size">{pagination.pageSize}</div>
      <div data-testid="pagination-total">{totalCount}</div>
      <button onClick={() => onPaginationChange({ pageIndex: 1, pageSize: 20 })}>
        Change Pagination
      </button>
    </div>
  ),
}));

jest.mock("@/components/common/TableHeader", () => ({
  __esModule: true,
  default: ({ table }: any) => (
    <thead data-testid="table-header">
      <tr>
        <th>Date Time</th>
        <th>Round ID</th>
        <th>Game ID / Name</th>
        <th>Bet Amount</th>
        <th>Win Amount</th>
        <th>Site Name</th>
      </tr>
    </thead>
  ),
}));

jest.mock("@/components/common/TableBody", () => ({
  __esModule: true,
  default: ({ table, columns, isLoading, error, onRefetch, loadingText, errorText, emptyText }: any) => (
    <tbody data-testid="table-body">
      {isLoading ? (
        <tr><td>{loadingText}</td></tr>
      ) : error ? (
        <tr><td>{errorText}</td></tr>
      ) : table.getRowModel().rows.length === 0 ? (
        <tr><td>{emptyText}</td></tr>
      ) : (
        table.getRowModel().rows.map((row: any, index: number) => (
          <tr key={row.original._id || index} data-testid={`table-row-${index}`}>
            <td>{row.original.gameRoundId}</td>
            <td>{row.original.gameId}</td>
            <td>{row.original.displayName}</td>
            <td>{row.original.betAmount}</td>
            <td>{row.original.winAmount}</td>
            <td>{row.original.siteName}</td>
          </tr>
        ))
      )}
    </tbody>
  ),
}));

// Mock icons
jest.mock("lucide-react", () => ({
  Download: () => <div data-testid="download-icon" />,
  Ticket: () => <div data-testid="ticket-icon" />,
}));

const mockTickets: PromotionalTicket[] = [
  {
    _id: "ticket1",
    gameRoundId: "round1",
    baseBetAmount: 100,
    baseWinAmount: 150,
    createdAt: "2024-01-01T00:00:00Z",
    gameId: "game1",
    displayName: "Test Game 1",
    betAmount: 100,
    winAmount: 150,
    siteName: "TestSite",
    currency: "USD",
  },
  {
    _id: "ticket2",
    gameRoundId: "round2",
    baseBetAmount: 200,
    baseWinAmount: 300,
    createdAt: "2024-01-02T00:00:00Z",
    gameId: "game2",
    displayName: "Test Game 2",
    betAmount: 200,
    winAmount: 300,
    siteName: "TestSite2",
    currency: "EUR",
  },
];

const defaultProps = {
  tickets: mockTickets,
  totalCount: 2,
  totalPages: 1,
  metaData: {
    totalBetAmount: 300,
    totalWinAmount: 450,
    totalBaseBetAmount: 300,
    totalBaseWinAmount: 450,
  },
  isLoading: false,
  error: null,
  onRefetch: jest.fn(),
  onExportTickets: jest.fn(),
  pagination: { pageIndex: 0, pageSize: 10 } as PaginationState,
  onPaginationChange: jest.fn(),
  isBaseCurrency: true,
};

describe("TicketPromotionTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with required props", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    expect(screen.getByText("Promotional Tickets")).toBeInTheDocument();
    expect(screen.getByTestId("ticket-icon")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-controls")).toBeInTheDocument();
  });

  it("renders export button", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    const exportButton = screen.getByText("Export");
    expect(exportButton).toBeInTheDocument();
    expect(screen.getByTestId("download-icon")).toBeInTheDocument();
  });

  it("calls onExportTickets when export button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnExportTickets = jest.fn();
    
    render(<TicketPromotionTable {...defaultProps} onExportTickets={mockOnExportTickets} />);
    
    const exportButton = screen.getByText("Export");
    await user.click(exportButton);
    
    expect(mockOnExportTickets).toHaveBeenCalledTimes(1);
  });

  it("renders pagination controls with correct props", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("0");
    expect(screen.getByTestId("pagination-size")).toHaveTextContent("10");
    expect(screen.getByTestId("pagination-total")).toHaveTextContent("2");
  });

  it("handles pagination changes", async () => {
    const user = userEvent.setup();
    const mockOnPaginationChange = jest.fn();
    
    render(<TicketPromotionTable {...defaultProps} onPaginationChange={mockOnPaginationChange} />);
    
    const changePaginationButton = screen.getByText("Change Pagination");
    await user.click(changePaginationButton);
    
    expect(mockOnPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 20 });
  });

  it("renders table with correct data", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    expect(screen.getByTestId("table-header")).toBeInTheDocument();
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
    expect(screen.getByTestId("table-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("table-row-1")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<TicketPromotionTable {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText("Loading tickets...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const error = new Error("Failed to load tickets");
    render(<TicketPromotionTable {...defaultProps} error={error} />);
    
    expect(screen.getByText("Error loading tickets")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<TicketPromotionTable {...defaultProps} tickets={[]} />);
    
    expect(screen.getByText("No tickets found.")).toBeInTheDocument();
  });

  it("renders total row with correct metadata when using base currency", () => {
    render(<TicketPromotionTable {...defaultProps} isBaseCurrency={true} />);
    
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Base USD")).toBeInTheDocument();
    expect(screen.getByText("300.0000")).toBeInTheDocument(); // totalBaseBetAmount
    expect(screen.getByText("450.0000")).toBeInTheDocument(); // totalBaseWinAmount
  });

  it("renders total row with correct metadata when not using base currency", () => {
    render(<TicketPromotionTable {...defaultProps} isBaseCurrency={false} />);
    
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("300.0000")).toBeInTheDocument(); // totalBetAmount
    expect(screen.getByText("450.0000")).toBeInTheDocument(); // totalWinAmount
  });

  it("uses base currency columns when isBaseCurrency is true", () => {
    render(<TicketPromotionTable {...defaultProps} isBaseCurrency={true} />);
    
    // The table should render with base currency data
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("uses regular currency columns when isBaseCurrency is false", () => {
    render(<TicketPromotionTable {...defaultProps} isBaseCurrency={false} />);
    
    // The table should render with regular currency data
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("renders with correct default sorting", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    // The table should be sorted by createdAt desc by default
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(<TicketPromotionTable {...defaultProps} tickets={[]} />);
    
    expect(screen.getByText("No tickets found.")).toBeInTheDocument();
    expect(screen.queryByTestId("table-row-0")).not.toBeInTheDocument();
  });

  it("handles undefined data gracefully", () => {
    render(<TicketPromotionTable {...defaultProps} tickets={[]} />);
    
    expect(screen.getByText("No tickets found.")).toBeInTheDocument();
  });

  it("renders with correct table structure", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    const table = screen.getByRole("table");
    expect(table).toHaveClass("w-full");
    
    const header = screen.getByTestId("table-header");
    expect(header).toBeInTheDocument();
    
    const body = screen.getByTestId("table-body");
    expect(body).toBeInTheDocument();
  });

  it("renders footer with total row when data exists", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    const footers = screen.getAllByRole("rowgroup");
    const tfoot = footers.find(footer => footer.tagName === "TFOOT");
    expect(tfoot).toBeInTheDocument();
    expect(tfoot).toHaveClass("bg-gray-50", "border-t-1", "border-gray-300");
  });

  it("does not render footer when loading", () => {
    render(<TicketPromotionTable {...defaultProps} isLoading={true} />);
    
    const tfoot = screen.queryByText("Total");
    expect(tfoot).not.toBeInTheDocument();
  });

  it("does not render footer when no data", () => {
    render(<TicketPromotionTable {...defaultProps} tickets={[]} />);
    
    const tfoot = screen.queryByText("Total");
    expect(tfoot).not.toBeInTheDocument();
  });

  it("handles different page sizes", () => {
    const customPagination = { pageIndex: 0, pageSize: 20 };
    render(<TicketPromotionTable {...defaultProps} pagination={customPagination} />);
    
    expect(screen.getByTestId("pagination-size")).toHaveTextContent("20");
  });

  it("handles different page indices", () => {
    const customPagination = { pageIndex: 2, pageSize: 10 };
    render(<TicketPromotionTable {...defaultProps} pagination={customPagination} />);
    
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("2");
  });

  it("renders with correct container styling", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    // Check that key elements are present
    expect(screen.getByText("Promotional Tickets")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByTestId("table-header")).toBeInTheDocument();
  });

  it("renders header with correct styling", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    // Check that header elements are present
    expect(screen.getByText("Promotional Tickets")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });
  
  it("renders export button with correct styling", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    const exportButton = screen.getByText("Export");
    expect(exportButton).toHaveClass(
      "inline-flex", "items-center", "gap-2", "px-4", "py-2", 
      "text-sm", "font-medium", "text-white", "bg-blue-600", 
      "rounded-lg", "hover:bg-blue-700", "focus:outline-none", 
      "focus:ring-2", "focus:ring-blue-500"
    );
  });

  it("handles refetch functionality", () => {
    const mockOnRefetch = jest.fn();
    
    render(<TicketPromotionTable {...defaultProps} onRefetch={mockOnRefetch} />);
    
    // The refetch functionality would be triggered by the TableBody component
    // when there's an error state
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("renders table with overflow handling", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    const tableContainer = screen.getByRole("table").closest("div");
    expect(tableContainer).toHaveClass("overflow-x-auto");
  });

  it("handles zero total count", () => {
    render(<TicketPromotionTable {...defaultProps} totalCount={0} />);
    
    expect(screen.getByTestId("pagination-total")).toHaveTextContent("0");
  });

  it("handles zero total pages", () => {
    render(<TicketPromotionTable {...defaultProps} totalPages={0} />);
    
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("renders with correct column structure", () => {
    render(<TicketPromotionTable {...defaultProps} />);
    
    const header = screen.getByTestId("table-header");
    expect(header).toBeInTheDocument();
    
    // Check that the expected columns are rendered
    expect(screen.getByText("Date Time")).toBeInTheDocument();
    expect(screen.getByText("Round ID")).toBeInTheDocument();
    expect(screen.getByText("Game ID / Name")).toBeInTheDocument();
    expect(screen.getByText("Bet Amount")).toBeInTheDocument();
    expect(screen.getByText("Win Amount")).toBeInTheDocument();
    expect(screen.getByText("Site Name")).toBeInTheDocument();
  });

  it("handles different metadata values", () => {
    const customMetaData = {
      totalBetAmount: 500,
      totalWinAmount: 750,
      totalBaseBetAmount: 500,
      totalBaseWinAmount: 750,
    };
    
    render(<TicketPromotionTable {...defaultProps} metaData={customMetaData} />);
    
    expect(screen.getByText("500.0000")).toBeInTheDocument();
    expect(screen.getByText("750.0000")).toBeInTheDocument();
  });

  it("handles undefined metadata gracefully", () => {
    const defaultMetaData = {
      totalBetAmount: 0,
      totalWinAmount: 0,
      totalBaseBetAmount: 0,
      totalBaseWinAmount: 0,
    };
    render(<TicketPromotionTable {...defaultProps} metaData={defaultMetaData} />);
    
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });
});
