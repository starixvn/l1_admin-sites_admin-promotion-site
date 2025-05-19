import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Filter from "../../../src/app/announcement/Filter";
import { PROMOTION_STATUS_OPTIONS_LIST } from "../../../src/constants/promotionStatusMap";

describe("Announcement Filter", () => {
  const mockOnStatusChange = jest.fn();
  const mockOnAddNew = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all filter elements", () => {
    render(
      <Filter
        status="All"
        pageSize={10}
        onStatusChange={mockOnStatusChange}
        onAddNew={mockOnAddNew}
      />
    );
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Add New Announcement")).toBeInTheDocument();
  });

  it("calls onStatusChange when status is changed", () => {
    render(
      <Filter
        status="All"
        pageSize={10}
        onStatusChange={mockOnStatusChange}
        onAddNew={mockOnAddNew}
      />
    );
    const select = screen.getByLabelText("Status");
    fireEvent.change(select, { target: { value: "Running" } });
    expect(mockOnStatusChange).toHaveBeenCalledWith("Running", 10);
  });

  it("calls onAddNew when Add New Announcement is clicked", () => {
    render(
      <Filter
        status="All"
        pageSize={10}
        onStatusChange={mockOnStatusChange}
        onAddNew={mockOnAddNew}
      />
    );
    const addButton = screen.getByText("Add New Announcement");
    fireEvent.click(addButton);
    expect(mockOnAddNew).toHaveBeenCalled();
  });

  it("renders all status options", () => {
    render(
      <Filter
        status="All"
        pageSize={10}
        onStatusChange={mockOnStatusChange}
        onAddNew={mockOnAddNew}
      />
    );
    PROMOTION_STATUS_OPTIONS_LIST.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });
});

