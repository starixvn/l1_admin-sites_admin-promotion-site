import { render, screen } from "@testing-library/react";
import RedemptionTrendChart from "@/app/promotion/performance/[id]/RedemptionTrendChart";

// Mock MUI X Charts
jest.mock("@mui/x-charts/LineChart", () => ({
  LineChart: ({ dataset, xAxis, series, yAxis, height, grid, margin }: any) => (
    <div data-testid="line-chart">
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

describe("RedemptionTrendChart", () => {
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
      redemptionRate: 85,
    },
  ];

  it("renders with correct title", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    expect(screen.getByText("Bonus Redemption Rate Trend")).toBeInTheDocument();
  });

  it("renders LineChart component", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("passes correct dataset to LineChart", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    const datasetElement = screen.getByTestId("chart-dataset");
    expect(datasetElement).toHaveTextContent(JSON.stringify(mockData));
  });

  it("configures xAxis correctly", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    const xAxisElement = screen.getByTestId("chart-xaxis");
    const expectedXAxis = [{
      dataKey: 'date',
      scaleType: 'point',
    }];
    expect(xAxisElement).toHaveTextContent(JSON.stringify(expectedXAxis));
  });

  it("configures series correctly", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    const seriesElement = screen.getByTestId("chart-series");
    const expectedSeries = [{
      dataKey: 'redemptionRate',
      label: 'Redemption Rate (%)',
      color: '#8b5cf6',
      curve: 'linear',
      showMark: true,
    }];
    expect(seriesElement).toHaveTextContent(JSON.stringify(expectedSeries));
  });

  it("calculates yAxis min and max values correctly", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    expect(yAxisConfig[0]).toMatchObject({
      min: expect.any(Number),
      max: expect.any(Number),
    });
    
    // Min should be floor(75 / 10) * 10 = 70
    expect(yAxisConfig[0].min).toBe(70);
    // Max should be ceil(85 / 10) * 10 = 90
    expect(yAxisConfig[0].max).toBe(90);
  });

  it("sets correct height", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    const heightElement = screen.getByTestId("chart-height");
    expect(heightElement).toHaveTextContent("256");
  });

  it("configures grid correctly", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    const gridElement = screen.getByTestId("chart-grid");
    const expectedGrid = { vertical: true, horizontal: true };
    expect(gridElement).toHaveTextContent(JSON.stringify(expectedGrid));
  });

  it("configures margin correctly", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    const marginElement = screen.getByTestId("chart-margin");
    const expectedMargin = { top: 20, bottom: 30, left: 40, right: 20 };
    expect(marginElement).toHaveTextContent(JSON.stringify(expectedMargin));
  });

  it("handles empty data array", () => {
    render(<RedemptionTrendChart data={[]} />);
    
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("chart-dataset")).toHaveTextContent("[]");
  });

  it("handles single data point", () => {
    const singleData = [mockData[0]];
    render(<RedemptionTrendChart data={singleData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Min should be floor(80 / 10) * 10 = 80
    expect(yAxisConfig[0].min).toBe(80);
    // Max should be ceil(80 / 10) * 10 = 80
    expect(yAxisConfig[0].max).toBe(80);
  });

  it("handles data with zero redemption rates", () => {
    const zeroData = [
      {
        date: "2024-01-01",
        bonusIssued: 1000,
        bonusRedeemed: 0,
        redemptionRate: 0,
      },
    ];
    render(<RedemptionTrendChart data={zeroData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    expect(yAxisConfig[0].min).toBe(0);
    expect(yAxisConfig[0].max).toBe(0);
  });

  it("handles data with very high redemption rates", () => {
    const highData = [
      {
        date: "2024-01-01",
        bonusIssued: 1000,
        bonusRedeemed: 950,
        redemptionRate: 95,
      },
    ];
    render(<RedemptionTrendChart data={highData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Min should be floor(95 / 10) * 10 = 90
    expect(yAxisConfig[0].min).toBe(90);
    // Max should be ceil(95 / 10) * 10 = 100
    expect(yAxisConfig[0].max).toBe(100);
  });

  it("handles data with decimal redemption rates", () => {
    const decimalData = [
      {
        date: "2024-01-01",
        bonusIssued: 1000,
        bonusRedeemed: 833,
        redemptionRate: 83.3,
      },
      {
        date: "2024-01-02",
        bonusIssued: 1200,
        bonusRedeemed: 916,
        redemptionRate: 76.3,
      },
    ];
    render(<RedemptionTrendChart data={decimalData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Min should be floor(76.3 / 10) * 10 = 70
    expect(yAxisConfig[0].min).toBe(70);
    // Max should be ceil(83.3 / 10) * 10 = 90
    expect(yAxisConfig[0].max).toBe(90);
  });

  it("renders with correct container structure", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    // Check that key elements are present
    expect(screen.getByText("Bonus Redemption Rate Trend")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("maintains consistent styling", () => {
    render(<RedemptionTrendChart data={mockData} />);
    
    const title = screen.getByText("Bonus Redemption Rate Trend");
    expect(title).toHaveClass("text-lg", "font-semibold", "text-gray-900", "mb-4");
  });

  it("handles data with negative redemption rates", () => {
    const negativeData = [
      {
        date: "2024-01-01",
        bonusIssued: 1000,
        bonusRedeemed: 800,
        redemptionRate: -5,
      },
    ];
    render(<RedemptionTrendChart data={negativeData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Min should be floor(-5 / 10) * 10 = -10
    expect(yAxisConfig[0].min).toBe(-10);
    // Max should be ceil(-5 / 10) * 10 = 0
    expect(yAxisConfig[0].max).toBe(0);
  });

  it("handles data with mixed number types", () => {
    const mixedData = [
      {
        date: "2024-01-01",
        bonusIssued: 1000,
        bonusRedeemed: 800,
        redemptionRate: "80" as any, // String number
      },
    ];
    
    // Should not throw error
    expect(() => render(<RedemptionTrendChart data={mixedData} />)).not.toThrow();
  });

  it("calculates yAxis with mixed data types", () => {
    const mixedData = [
      {
        date: "2024-01-01",
        bonusIssued: 1000,
        bonusRedeemed: 800,
        redemptionRate: "80" as any,
      },
    ];
    
    render(<RedemptionTrendChart data={mixedData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Should handle string numbers correctly
    expect(yAxisConfig[0].min).toBe(80);
    expect(yAxisConfig[0].max).toBe(80);
  });

  it("handles data with very large redemption rates", () => {
    const largeData = [
      {
        date: "2024-01-01",
        bonusIssued: 1000,
        bonusRedeemed: 1200,
        redemptionRate: 120,
      },
    ];
    render(<RedemptionTrendChart data={largeData} />);
    
    const yAxisElement = screen.getByTestId("chart-yaxis");
    const yAxisConfig = JSON.parse(yAxisElement.textContent || "[]");
    
    // Min should be floor(120 / 10) * 10 = 120
    expect(yAxisConfig[0].min).toBe(120);
    // Max should be ceil(120 / 10) * 10 = 120
    expect(yAxisConfig[0].max).toBe(120);
  });
});
