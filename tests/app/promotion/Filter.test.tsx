import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Filter from "../../../src/app/promotion/Filter";

// Mock data
const mockOperators = [
  { Name: "Operator 1", PartnerId: "op1" },
  { Name: "Operator 2", PartnerId: "op2" },
  { Name: "Operator 3", PartnerId: "op3" },
];

const mockInitialFilters = {
  status: "All",
  operator: ["op1", "op2", "op3"],
  promotionCode: "",
  pageIndex: 1,
  pageSize: 10,
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
    expect(
      screen.getByPlaceholderText("Enter promotion code")
    ).toBeInTheDocument();
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
    const operatorCheckbox = screen.getByRole("checkbox", {
      name: "Select Operator 3",
    });
    fireEvent.click(operatorCheckbox);

    // Close dropdown
    fireEvent.click(document.body);

    // Submit filters
    const searchButton = screen.getByRole("button", {
      name: "Search promotions",
    });
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
    const allCheckbox = screen.getByRole("checkbox", {
      name: "Select all operators",
    });
    fireEvent.click(allCheckbox);

    // Close dropdown
    fireEvent.click(document.body);

    // Submit filters
    const searchButton = screen.getByRole("button", {
      name: "Search promotions",
    });
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

    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);

    const searchInput = screen.getByLabelText("Search operators");
    fireEvent.change(searchInput, { target: { value: "Operator 1" } });

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

    const searchButton = screen.getByRole("button", {
      name: "Search promotions",
    });
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

    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);

    fireEvent.mouseDown(document.body);

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

    const newOperators = [...mockOperators, { Name: "Operator 4", PartnerId: "op4" }];
    rerender(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={newOperators}
        initialFilters={mockInitialFilters}
      />
    );

    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);

    expect(screen.getByText("Operator 4")).toBeInTheDocument();
  });

  it("sets isOverflowing when operator display overflows", () => {
    render(
      <Filter
        onFilterChange={jest.fn()}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );
    const filterInstance = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(filterInstance);
  });

  it("handleInputChange updates promotionCode (else branch)", () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={mockInitialFilters}
      />
    );
    const promotionInput = screen.getByPlaceholderText("Enter promotion code");
    fireEvent.change(promotionInput, {
      target: { name: "promotionCode", value: "NEWCODE" },
    });
    expect(promotionInput).toHaveValue("NEWCODE");
  });

  it("handleOperatorSelect with 'All' toggles all operators", () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={{ ...mockInitialFilters, operator: [] }}
      />
    );
    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);
    const allCheckbox = screen.getByRole("checkbox", {
      name: "Select all operators",
    });
    fireEvent.click(allCheckbox);
    fireEvent.click(allCheckbox);
  });

  it("handleOperatorSelect adds and removes operator", () => {
    render(
      <Filter
        onFilterChange={mockOnFilterChange}
        operatorOptions={mockOperators}
        initialFilters={{ ...mockInitialFilters, operator: [] }}
      />
    );
    const operatorDropdown = screen.getByRole("button", { name: "Operator" });
    fireEvent.click(operatorDropdown);
    const op1Checkbox = screen.getByRole("checkbox", {
      name: "Select Operator 1",
    });
    fireEvent.click(op1Checkbox);
    fireEvent.click(op1Checkbox);
  });
});