import { render, screen } from "@testing-library/react";
import DailyBonusChart from "@/app/promotion/performance/[id]/DailyBonusChart";

// Mock MUI X Charts
jest.mock("@mui/x-charts/BarChart", () => ({
  BarChart: ({ dataset, xAxis, series, yAxis, height, grid, margin }: any) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-dataset">{JSON.stringify(dataset)}</div>
      <div data-testid="chart-xaxis">{JSON.stringify(xAxis)}</div>
      <div data-testid="chart-series">{JSON.stringify(series)}</div>
      <div data-testid="chart-yaxis">{JSON.stringify(yAxis)}</div>
      <div data-testid="chart-height">{height}</div>
      <div data-testid="chart-grid">{JSON.stringify(grid)}</div>
      <div data-testid="chart-margin">{JSON.stringify(margin)}</div>
    </div>
  ),
}));

describe("DailyBonusChart", () => {
  const mockData = [
    {
      date: "2024-01-01",
      bonusIssued: 1000,
      bonusRedeemed: 800,
      redemptionRate: 80,
    },
    {
      date: "2024-01-02",
      bonusIssued: 1200,
      bonusRedeemed: 900,
      redemptionRate: 75,
    },
    {
      date: "2024-01-03",
      bonusIssued: 1500,
      bonusRedeemed: 1200,
      redemptionRate: 80,
    },
  ];

  it("renders with correct title", () => {
    render(<DailyBonusChart data={mockData} />);
    
    expect(screen.getByText("Daily Bonus Issued vs. Redeemed")).toBeInTheDocument();
  });

  it("renders BarChart component", () => {
    render(<DailyBonusChart data={mockData} />);
    
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("passes correct dataset to BarChart", () => {
    render(<DailyBonusChart data={mockData} />);
    
    const datasetElement = screen.getByTestId("chart-dataset");
    expect(datasetElement).toHaveTextContent(JSON.stringify(mockData));
  });

  it("configures xAxis correctly", () => {
    render(<DailyBonusChart data={mockData} />);
    
    const xAxisElement = screen.getByTestId("chart-xaxis");
    const expectedXAxis = [{
      dataKey: 'date',
      scaleType: 'band',
    }];
    expect(xAxisElement).toHaveTextContent(JSON.stringify(expectedXAxis));
  });

  it("configures series correctly", () => {
    render(<DailyBonusChart data={mockData} />);
    
    const seriesElement = screen.getByTestId("chart-series");
    const expectedSeries = [
      {
        dataKey: 'bonusIssued',
        label: 'Bonus Issued',
        color: '#33CCCC',
      },
      {
        dataKey: 'bonusRedeemed',
        label: 'Bonus Redeemed',
        color: '#00CC66',
      }
    ];
    expect(seriesElement).toHaveTextContent(JSON.stringify(expectedSeries));
  });

  it("calculates yAxis max value correctly", () => {
    render(<DailyBonusChart data={mockData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    expect(yAxisConfig[0]).toMatchObject({
      min: 0,
      max: expect.any(Number),
    });
    
    // Max should be 1.1 * max(bonusIssued, bonusRedeemed) = 1.1 * 1500 = 1650
    expect(yAxisConfig[0].max).toBeCloseTo(1650, 5);
  });

  it("sets correct height", () => {
    render(<DailyBonusChart data={mockData} />);
    
    const heightElement = screen.getByTestId("chart-height");
    expect(heightElement).toHaveTextContent("256");
  });

  it("configures grid correctly", () => {
    render(<DailyBonusChart data={mockData} />);
    
    const gridElement = screen.getByTestId("chart-grid");
    const expectedGrid = { vertical: true, horizontal: true };
    expect(gridElement).toHaveTextContent(JSON.stringify(expectedGrid));
  });

  it("configures margin correctly", () => {
    render(<DailyBonusChart data={mockData} />);
    
    const marginElement = screen.getByTestId("chart-margin");
    const expectedMargin = { top: 20, bottom: 40, left: 50, right: 30 };
    expect(marginElement).toHaveTextContent(JSON.stringify(expectedMargin));
  });

  it("handles empty data array", () => {
    render(<DailyBonusChart data={[]} />);
    
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("chart-dataset")).toHaveTextContent("[]");
  });

  it("handles single data point", () => {
    const singleData = [mockData[0]];
    render(<DailyBonusChart data={singleData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Max should be 1.1 * max(1000, 800) = 1.1 * 1000 = 1100
    expect(yAxisConfig[0].max).toBe(1100);
  });

  it("handles data with zero values", () => {
    const zeroData = [
      {
        date: "2024-01-01",
        bonusIssued: 0,
        bonusRedeemed: 0,
        redemptionRate: 0,
      },
    ];
    render(<DailyBonusChart data={zeroData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    expect(yAxisConfig[0].max).toBe(0);
  });

  it("handles data with very large values", () => {
    const largeData = [
      {
        date: "2024-01-01",
        bonusIssued: 1000000,
        bonusRedeemed: 800000,
        redemptionRate: 80,
      },
    ];
    render(<DailyBonusChart data={largeData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Max should be 1.1 * 1000000 = 1100000
    expect(yAxisConfig[0].max).toBe(1100000);
  });

  it("renders with correct container structure", () => {
    render(<DailyBonusChart data={mockData} />);
    
    // Check that key elements are present
    expect(screen.getByText("Daily Bonus Issued vs. Redeemed")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("maintains consistent styling", () => {
    render(<DailyBonusChart data={mockData} />);
    
    const title = screen.getByText("Daily Bonus Issued vs. Redeemed");
    expect(title).toHaveClass("text-lg", "font-semibold", "text-gray-900", "mb-4");
  });

  it("handles data with mixed number types", () => {
    const mixedData = [
      {
        date: "2024-01-01",
        bonusIssued: "1000" as any, // String number
        bonusRedeemed: 800,
        redemptionRate: 80,
      },
    ];
    
    // Should not throw error
    expect(() => render(<DailyBonusChart data={mixedData} />)).not.toThrow();
  });

  it("calculates yAxis max with mixed data types", () => {
    const mixedData = [
      {
        date: "2024-01-01",
        bonusIssued: "1000" as any,
        bonusRedeemed: 800,
        redemptionRate: 80,
      },
    ];
    
    render(<DailyBonusChart data={mixedData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Should handle string numbers correctly
    expect(yAxisConfig[0].max).toBe(1100);
  });
});
