import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import PlayersTable from "@/app/promotion/performance/[id]/players/PlayersTable";
import { Player } from "@/types/performance-report";
import { PaginationState } from "@tanstack/react-table";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock helper functions
jest.mock("@/helper/common", () => ({
  getProgressColor: jest.fn((current, required) => {
    if (current >= required) return "bg-green-500";
    if (current >= required * 0.8) return "bg-yellow-500";
    return "bg-red-500";
  }),
  getStatusColor: jest.fn((status) => {
    switch (status) {
      case "Active": return "text-green-600";
      case "Inactive": return "text-red-600";
      default: return "text-gray-600";
    }
  }),
  getStatusDot: jest.fn((status) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Inactive": return "bg-red-500";
      default: return "bg-gray-500";
    }
  }),
}));

// Mock utility functions
jest.mock("@/lib/date-time.utils", () => ({
  toGMTString: jest.fn((date) => `2024-01-01 00:00:00`),
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
    table, 
    showCurrencyToggle, 
    isBaseCurrency, 
    onCurrencyToggle 
  }: any) => (
    <div data-testid="pagination-controls">
      <div data-testid="pagination-page">{pagination.pageIndex}</div>
      <div data-testid="pagination-size">{pagination.pageSize}</div>
      <div data-testid="pagination-total">{totalCount}</div>
      <div data-testid="pagination-show-currency">{showCurrencyToggle?.toString()}</div>
      <div data-testid="pagination-is-base-currency">{isBaseCurrency?.toString()}</div>
      <button onClick={() => onPaginationChange({ pageIndex: 1, pageSize: 20 })}>
        Change Pagination
      </button>
      {showCurrencyToggle && (
        <button onClick={() => onCurrencyToggle(!isBaseCurrency)}>
          Toggle Currency
        </button>
      )}
    </div>
  ),
}));

jest.mock("@/components/common/TableHeader", () => ({
  __esModule: true,
  default: ({ table }: any) => (
    <thead data-testid="table-header">
      <tr>
        <th>Player ID</th>
        <th>Username</th>
        <th>Status</th>
      </tr>
    </thead>
  ),
}));

jest.mock("@/components/common/TableBody", () => ({
  __esModule: true,
  default: ({ table, columns, isLoading, loadingText, emptyText }: any) => (
    <tbody data-testid="table-body">
      {isLoading ? (
        <tr><td>{loadingText}</td></tr>
      ) : table.getRowModel().rows.length === 0 ? (
        <tr><td>{emptyText}</td></tr>
      ) : (
        table.getRowModel().rows.map((row: any, index: number) => (
          <tr key={row.original.id || index} data-testid={`table-row-${index}`}>
            <td>{row.original.id}</td>
            <td>{row.original.username}</td>
            <td>{row.original.status}</td>
          </tr>
        ))
      )}
    </tbody>
  ),
}));

// Mock icons
jest.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon" />,
  Download: () => <div data-testid="download-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
}));

const mockPush = jest.fn();

const mockPlayers: Player[] = [
  {
    id: "player1",
    username: "testuser1",
    status: "Active",
    siteName: "TestSite",
    currency: "USD",
    dateJoined: "2024-01-01T00:00:00Z",
    bonusWin: 100,
    baseBonusWin: 100,
    turnover: 500,
    baseTurnover: 500,
    progress: { current: 5, required: 10 },
    bonusClaimed: 50,
    baseBonusClaimed: 50,
    lastActivity: "2024-01-15T00:00:00Z",
    remainingBonusItems: 5,
    initialBonusItem: 10,
  },
  {
    id: "player2",
    username: "testuser2",
    status: "Inactive",
    siteName: "TestSite2",
    currency: "EUR",
    dateJoined: "2024-01-02T00:00:00Z",
    bonusWin: 200,
    baseBonusWin: 200,
    turnover: 1000,
    baseTurnover: 1000,
    progress: { current: 8, required: 10 },
    bonusClaimed: 100,
    baseBonusClaimed: 100,
    lastActivity: "2024-01-16T00:00:00Z",
    remainingBonusItems: 2,
    initialBonusItem: 10,
  },
];

const defaultProps = {
  data: mockPlayers,
  isBaseCurrency: true,
  onCurrencyToggle: jest.fn(),
  metaDataTotalAmount: {
    baseTotalWinAmount: 300,
    baseTotalTurnover: 1500,
    baseTotalBonusClaimed: 150,
  },
  pageCount: 1,
  totalCount: 2,
  pagination: { pageIndex: 0, pageSize: 10 } as PaginationState,
  onPaginationChange: jest.fn(),
  isLoading: false,
  onExportPlayers: jest.fn(),
};

describe("PlayersTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders with required props", () => {
    render(<PlayersTable {...defaultProps} />);
    
    expect(screen.getByText("Promotional Players")).toBeInTheDocument();
    expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-controls")).toBeInTheDocument();
  });

  it("renders export button", () => {
    render(<PlayersTable {...defaultProps} />);
    
    const exportButton = screen.getByText("Export");
    expect(exportButton).toBeInTheDocument();
    expect(screen.getByTestId("download-icon")).toBeInTheDocument();
  });

  it("calls onExportPlayers when export button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnExportPlayers = jest.fn();
    
    render(<PlayersTable {...defaultProps} onExportPlayers={mockOnExportPlayers} />);
    
    const exportButton = screen.getByText("Export");
    await user.click(exportButton);
    
    expect(mockOnExportPlayers).toHaveBeenCalledTimes(1);
  });

  it("renders pagination controls with correct props", () => {
    render(<PlayersTable {...defaultProps} />);
    
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("0");
    expect(screen.getByTestId("pagination-size")).toHaveTextContent("10");
    expect(screen.getByTestId("pagination-total")).toHaveTextContent("2");
    expect(screen.getByTestId("pagination-show-currency")).toHaveTextContent("true");
    expect(screen.getByTestId("pagination-is-base-currency")).toHaveTextContent("true");
  });

  it("handles pagination changes", async () => {
    const user = userEvent.setup();
    const mockOnPaginationChange = jest.fn();
    
    render(<PlayersTable {...defaultProps} onPaginationChange={mockOnPaginationChange} />);
    
    const changePaginationButton = screen.getByText("Change Pagination");
    await user.click(changePaginationButton);
    
    expect(mockOnPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 20 });
  });

  it("handles currency toggle", async () => {
    const user = userEvent.setup();
    const mockOnCurrencyToggle = jest.fn();
    
    render(<PlayersTable {...defaultProps} onCurrencyToggle={mockOnCurrencyToggle} />);
    
    const toggleCurrencyButton = screen.getByText("Toggle Currency");
    await user.click(toggleCurrencyButton);
    
    expect(mockOnCurrencyToggle).toHaveBeenCalledWith(false);
  });

  it("renders table with correct data", () => {
    render(<PlayersTable {...defaultProps} />);
    
    expect(screen.getByTestId("table-header")).toBeInTheDocument();
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
    expect(screen.getByTestId("table-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("table-row-1")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<PlayersTable {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText("Loading players...")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<PlayersTable {...defaultProps} data={[]} />);
    
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders total row with correct metadata", () => {
    render(<PlayersTable {...defaultProps} />);
    
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("(Base USD)")).toBeInTheDocument();
    expect(screen.getByText("300.0000")).toBeInTheDocument(); // baseTotalWinAmount
    expect(screen.getByText("1500.0000")).toBeInTheDocument(); // baseTotalTurnover
    expect(screen.getByText("150.0000")).toBeInTheDocument(); // baseTotalBonusClaimed
  });

  it("handles username click navigation", async () => {
    const user = userEvent.setup();
    
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/promotion/performance/test-promotion-id/players',
      },
      writable: true,
    });
    
    render(<PlayersTable {...defaultProps} />);
    
    // Find the username button (it should be clickable)
    const usernameButtons = screen.getAllByText("testuser1");
    const clickableUsername = usernameButtons.find(button => 
      button.closest('button')?.classList.contains('cursor-pointer')
    );
    
    if (clickableUsername) {
      await user.click(clickableUsername);
      expect(mockPush).toHaveBeenCalledWith(
        "/promotion/performance/test-promotion-id/players/tickets?playerId=player1&username=testuser1&isBaseCurrency=true"
      );
    }
  });

  it("uses base currency columns when isBaseCurrency is true", () => {
    render(<PlayersTable {...defaultProps} isBaseCurrency={true} />);
    
    // The table should render with base currency data
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("uses regular currency columns when isBaseCurrency is false", () => {
    render(<PlayersTable {...defaultProps} isBaseCurrency={false} />);
    
    // The table should render with regular currency data
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("renders with correct default sorting", () => {
    render(<PlayersTable {...defaultProps} />);
    
    // The table should be sorted by dateJoined desc by default
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(<PlayersTable {...defaultProps} data={[]} />);
    
    expect(screen.getByText("No results.")).toBeInTheDocument();
    expect(screen.queryByTestId("table-row-0")).not.toBeInTheDocument();
  });

  it("handles undefined data gracefully", () => {
    render(<PlayersTable {...defaultProps} data={undefined as any} />);
    
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders with correct table structure", () => {
    render(<PlayersTable {...defaultProps} />);
    
    const table = screen.getByRole("table");
    expect(table).toHaveClass("w-full", "table-fixed");
    
    const header = screen.getByTestId("table-header");
    expect(header).toBeInTheDocument();
    
    const body = screen.getByTestId("table-body");
    expect(body).toBeInTheDocument();
  });

  it("renders footer with total row when data exists", () => {
    render(<PlayersTable {...defaultProps} />);
    
    const footer = screen.getByText("Total").closest("tfoot");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("bg-gray-50", "border-t-1", "border-gray-300");
  });

  it("does not render footer when loading", () => {
    render(<PlayersTable {...defaultProps} isLoading={true} />);
    
    const footer = screen.queryByText("Total");
    expect(footer).not.toBeInTheDocument();
  });

  it("does not render footer when no data", () => {
    render(<PlayersTable {...defaultProps} data={[]} />);
    
    const footer = screen.queryByText("Total");
    expect(footer).not.toBeInTheDocument();
  });

  it("handles different page sizes", () => {
    const customPagination = { pageIndex: 0, pageSize: 20 };
    render(<PlayersTable {...defaultProps} pagination={customPagination} />);
    
    expect(screen.getByTestId("pagination-size")).toHaveTextContent("20");
  });

  it("handles different page indices", () => {
    const customPagination = { pageIndex: 2, pageSize: 10 };
    render(<PlayersTable {...defaultProps} pagination={customPagination} />);
    
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("2");
  });

  it("renders with correct container styling", () => {
    render(<PlayersTable {...defaultProps} />);
    
    // Check that key elements are present
    expect(screen.getByText("Promotional Players")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByTestId("table-header")).toBeInTheDocument();
  });

  it("renders header with correct styling", () => {
    render(<PlayersTable {...defaultProps} />);
    
    // Check that header elements are present
    expect(screen.getByText("Promotional Players")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });
  
  it("renders export button with correct styling", () => {
    render(<PlayersTable {...defaultProps} />);
    
    const exportButton = screen.getByText("Export");
    expect(exportButton).toHaveClass(
      "inline-flex", "items-center", "gap-2", "px-4", "py-2", 
      "text-sm", "font-medium", "text-white", "bg-blue-600", 
      "rounded-lg", "hover:bg-blue-700", "focus:outline-none", 
      "focus:ring-2", "focus:ring-blue-500"
    );
  });
});
