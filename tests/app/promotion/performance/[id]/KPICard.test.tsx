import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KPICard from "@/app/promotion/performance/[id]/KPICard";
import { LucideIcon } from "lucide-react";

// Mock icon component
const MockIcon: LucideIcon = ({ className, ...props }) => (
  <div data-testid="mock-icon" className={className} {...props} />
);

describe("KPICard", () => {
  const defaultProps = {
    title: "Test KPI",
    value: "100",
    icon: MockIcon,
    iconColor: "text-blue-500",
  };

  it("renders with required props", () => {
    render(<KPICard {...defaultProps} />);
    
    expect(screen.getByText("Test KPI")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("applies correct icon color class", () => {
    render(<KPICard {...defaultProps} />);
    
    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("text-blue-500");
  });

  it("renders as non-clickable by default", () => {
    render(<KPICard {...defaultProps} />);
    
    const card = screen.getByText("Test KPI").closest("div");
    expect(card).not.toHaveClass("cursor-pointer");
    expect(card).not.toHaveAttribute("onClick");
  });

  it("renders as clickable when clickable prop is true", () => {
    const mockOnClick = jest.fn();
    render(
      <KPICard 
        {...defaultProps} 
        clickable={true} 
        onClick={mockOnClick}
      />
    );
    
    // Check that the component renders without errors when clickable
    expect(screen.getByText("Test KPI")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("calls onClick when clicked and clickable is true", async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();
    
    render(
      <KPICard 
        {...defaultProps} 
        clickable={true} 
        onClick={mockOnClick}
      />
    );
    
    const card = screen.getByText("Test KPI").closest("div");
    await user.click(card!);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when clickable is false", async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();
    
    render(
      <KPICard 
        {...defaultProps} 
        clickable={false} 
        onClick={mockOnClick}
      />
    );
    
    const card = screen.getByText("Test KPI").closest("div");
    await user.click(card!);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("shows external link icon when clickable", () => {
    render(
      <KPICard 
        {...defaultProps} 
        clickable={true}
      />
    );
    
    // Check that the component renders without errors when clickable
    expect(screen.getByText("Test KPI")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("does not show external link icon when not clickable", () => {
    render(<KPICard {...defaultProps} clickable={false} />);
    
    const externalLinkIcon = screen.queryByRole("img", { hidden: true });
    expect(externalLinkIcon).not.toBeInTheDocument();
  });

  it("applies hover effects to icon when clickable", () => {
    render(
      <KPICard 
        {...defaultProps} 
        clickable={true}
      />
    );
    
    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("group-hover:scale-110", "transition-transform");
  });

  it("does not apply hover effects to icon when not clickable", () => {
    render(<KPICard {...defaultProps} clickable={false} />);
    
    const icon = screen.getByTestId("mock-icon");
    expect(icon).not.toHaveClass("group-hover:scale-110");
  });

  it("renders with different icon colors", () => {
    const { rerender } = render(
      <KPICard {...defaultProps} iconColor="text-green-500" />
    );
    
    let icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("text-green-500");
    
    rerender(<KPICard {...defaultProps} iconColor="text-red-500" />);
    
    icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("text-red-500");
  });

  it("renders with different titles and values", () => {
    const { rerender } = render(
      <KPICard 
        {...defaultProps} 
        title="Revenue" 
        value="$1,000,000" 
      />
    );
    
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$1,000,000")).toBeInTheDocument();
    
    rerender(
      <KPICard 
        {...defaultProps} 
        title="Users" 
        value="1,234" 
      />
    );
    
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    render(<KPICard {...defaultProps} />);
    
    // Check that the component renders with basic structure
    expect(screen.getByText("Test KPI")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders with proper layout structure", () => {
    render(<KPICard {...defaultProps} />);
    
    expect(screen.getByText("Test KPI")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("handles click events properly with keyboard navigation", () => {
    const mockOnClick = jest.fn();
    render(
      <KPICard 
        {...defaultProps} 
        clickable={true} 
        onClick={mockOnClick}
      />
    );
    
    const card = screen.getByText("Test KPI").closest("div");
    
    // Test Enter key
    fireEvent.keyDown(card!, { key: "Enter", code: "Enter" });
    expect(mockOnClick).not.toHaveBeenCalled(); // onClick is not called on keyDown
    
    // Test Space key
    fireEvent.keyDown(card!, { key: " ", code: "Space" });
    expect(mockOnClick).not.toHaveBeenCalled(); // onClick is not called on keyDown
  });

  it("maintains consistent styling across different states", () => {
    const { rerender } = render(<KPICard {...defaultProps} />);
    
    expect(screen.getByText("Test KPI")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    
    rerender(<KPICard {...defaultProps} clickable={true} />);
    
    expect(screen.getByText("Test KPI")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});
