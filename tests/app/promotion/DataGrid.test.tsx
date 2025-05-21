import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataGrid from "../../../src/app/promotion/DataGrid";
import { GAME_TYPES } from "../../../src/constants/gameTypes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as DataGridUtils from '../../../src/app/promotion/DataGrid';
import { toGMTString } from "../../../src/lib/date-time.utils";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

global.fetch = jest.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  return <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>;
};

const mockPromotions = Array.from({ length: 15 }).map((_, i) => ({
  _id: `${i + 1}`,
  name: `Promotion ${i + 1}`,
  code: `CODE${i + 1}`,
  gameConfigType: GAME_TYPES.CLASSIC,
  bonusItemCount: 10,
  gameIds: [1, 2],
  operatorId: "op1",
  startDate: "2024-03-20T00:00:00Z",
  endDate: "2024-03-25T00:00:00Z",
  betLevels: [],
  offeredSiteNames: [],
  currencyGroups: [],
  offeredPlayerIds: [],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  status: "ACTIVE",
  __v: 0,
}));

describe("DataGrid Component with Pagination", () => {
  const mockOnDelete = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows 10 rows per page and paginates correctly", () => {
    const pageSize = 10;
    const currentPage = 1;
    const totalItems = mockPromotions.length;
    const setPage = jest.fn();
    const { rerender } = render(
      <DataGrid
        promotions={mockPromotions.slice(0, pageSize)}
        loading={false}
        error={null}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={jest.fn()}
      />,
      { wrapper }
    );

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(11);

    rerender(
      <DataGrid
        promotions={mockPromotions.slice(10, 20)}
        loading={false}
        error={null}
        onDelete={mockOnDelete}
        onRefresh={mockOnRefresh}
        currentPage={2}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={jest.fn()}
      />
    );

    expect(screen.getByText("Promotion 11")).toBeInTheDocument();
  });
});

describe('toGMTString', () => {
  it('returns empty string if no dateStr', () => {
    expect(toGMTString('', 7)).toBe('');
  });
  it('returns formatted string for valid date', () => {
    expect(toGMTString('2024-01-01T00:00:00Z', 7)).toContain('01/01/2024');
  });
});

describe('getGameTypeName', () => {
  it('returns Classic Slots for GAME_TYPES.CLASSIC', () => {
    expect(DataGridUtils.getGameTypeName(GAME_TYPES.CLASSIC)).toBe('Classic Slots');
  });
  it('returns Cascading Slots for GAME_TYPES.CASCADING', () => {
    expect(DataGridUtils.getGameTypeName(GAME_TYPES.CASCADING)).toBe('Cascading Slots');
  });
  it('returns empty string for unknown type', () => {
    expect(DataGridUtils.getGameTypeName(999)).toBe('');
  });
});

describe('getStatusStyle', () => {
  it('returns green for running', () => {
    expect(DataGridUtils.getStatusStyle('running')).toBe('bg-gray-100 text-gray-500');
  });
  it('returns yellow for upcoming', () => {
    expect(DataGridUtils.getStatusStyle('upcoming')).toBe('bg-gray-100 text-gray-500');
  });
  it('returns gray for completed', () => {
    expect(DataGridUtils.getStatusStyle('completed')).toBe('bg-gray-100 text-gray-500');
  });
  it('returns default for unknown', () => {
    expect(DataGridUtils.getStatusStyle('other')).toBe('bg-gray-100 text-gray-500');
  });
});