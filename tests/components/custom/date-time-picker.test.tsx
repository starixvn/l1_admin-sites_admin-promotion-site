import { render, screen, fireEvent } from "@testing-library/react";
import DateTimePicker from "@/components/custom/date-time-picker";

describe("DateTimePicker", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<DateTimePicker onChange={mockOnChange} />);
    
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText(/\d{2}-\d{2}-\d{4} \d{2}:\d{2}/)).toBeInTheDocument();
  });

  it("renders with label and GMT+7 indicator", () => {
    render(<DateTimePicker onChange={mockOnChange} label="Test Label" />);
    
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("(GMT+7)")).toBeInTheDocument();
  });

  it("shows error message when provided", () => {
    render(
      <DateTimePicker 
        onChange={mockOnChange} 
        error="This is an error message" 
      />
    );
    
    expect(screen.getByText("This is an error message")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<DateTimePicker onChange={mockOnChange} disabled={true} />);
    
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("opens calendar when button is clicked", () => {
    render(<DateTimePicker onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument(); // calendar grid
    expect(screen.getAllByRole("combobox")).toHaveLength(2); // hour and minute selects
  });

  it("updates time when hour and minute are changed", () => {
    render(<DateTimePicker onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByRole("button"));
    
    const [hourSelect, minuteSelect] = screen.getAllByRole("combobox");
    
    fireEvent.change(hourSelect, { target: { value: "10" } });
    fireEvent.change(minuteSelect, { target: { value: "30" } });
    
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });
});