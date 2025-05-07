import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Filter from "../Filter";

// Mock data
const mockOperators = [
  { name: "Operator 1", id: "op1" },
  { name: "Operator 2", id: "op2" },
  { name: "Operator 3", id: "op3" },
];

const mockInitialFilters = {
  status: "All",
  operator: ["op1", "op2", "op3"],
  promotionCode: "",
};

describe("Filter Component", () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all filter elements correctly", () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    // Check if all main elements are rendered
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Operator")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter promotion code")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("initializes with provided filters", () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    expect(screen.getByDisplayValue("All")).toBeInTheDocument();
    expect(screen.getByDisplayValue("")).toBeInTheDocument(); // promotion code
  });

  it("handles status filter change", () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    const statusSelect = screen.getByLabelText("Status");
    fireEvent.change(statusSelect, { target: { value: "Active" } });

    expect(statusSelect).toHaveValue("All");
  });

  it("handles promotion code input change", () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    const promotionInput = screen.getByPlaceholderText("Enter promotion code");
    fireEvent.change(promotionInput, { target: { value: "TEST123" } });

    expect(promotionInput).toHaveValue("TEST123");
  });

  it("handles operator selection", async () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    // Open operator dropdown
    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);

    // Select an operator
    const operatorCheckbox = screen.getByRole("checkbox", { name: "Select Operator 3" });
    fireEvent.click(operatorCheckbox);

    // Close dropdown
    fireEvent.click(document.body);

    // Submit filters
    const searchButton = screen.getByRole("button", { name: "Search promotions" });
    fireEvent.click(searchButton);

    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it("handles 'All' operator selection", async () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    // Open operator dropdown
    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);

    // Select 'All' option
    const allCheckbox = screen.getByRole("checkbox", { name: "Select all operators" });
    fireEvent.click(allCheckbox);

    // Close dropdown
    fireEvent.click(document.body);

    // Submit filters
    const searchButton = screen.getByRole("button", { name: "Search promotions" });
    fireEvent.click(searchButton);

    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it("handles operator search", async () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    // Open operator dropdown
    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);

    // Search for an operator
    const searchInput = screen.getByLabelText("Search operators");
    fireEvent.change(searchInput, { target: { value: "Operator 1" } });

    // Verify filtered results
    expect(screen.getByText("Operator 1")).toBeInTheDocument();
    expect(screen.queryByText("Operator 2")).not.toBeInTheDocument();
  });

  it("submits filters when search button is clicked", () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    const searchButton = screen.getByRole("button", { name: "Search promotions" });
    fireEvent.click(searchButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(mockInitialFilters);
  });

  it("handles click outside operator dropdown", async () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    // Open operator dropdown
    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);

    // Click outside
    fireEvent.mouseDown(document.body);

    // Verify dropdown is closed
    expect(screen.queryByLabelText("Search operators")).not.toBeInTheDocument();
  });

  it("updates operator selection when operatorOptions change", () => {
    const { rerender } = render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );

    // Rerender with new operator options
    const newOperators = [...mockOperators, { name: "Operator 4", id: "op4" }];
    rerender(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={newOperators}
        initialFilters={mockInitialFilters}
      />
    );

    // Open operator dropdown
    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);

    // Verify new operator is in the list
    expect(screen.getByText("Operator 4")).toBeInTheDocument();
  });
});
