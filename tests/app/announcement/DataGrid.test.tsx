import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataGrid from "../../../src/app/announcement/DataGrid";
import { PROMOTION_STATUS_OPTIONS } from "@/constants/promotionStatusMap";

// Mock the ImageIcon component
jest.mock("lucide-react", () => ({
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  Pencil: () => <span data-testid="pencil-icon">Pencil</span>,
  Trash2: () => <span data-testid="trash-icon">Trash</span>,
  ImageIcon: () => <span data-testid="image-icon">Image</span>
}));

// Mock configs
jest.mock("../../../configs", () => ({
  apiConfigurationUrl: "http://test-url"
}));

const mockAnnouncements = [
  {
    _id: "1",
    template: 1,
    fromDate: "2099-01-01T00:00:00Z",
    toDate: "2099-01-10T00:00:00Z",
    promotionTitle: { "en-US": "Promo 1" },
    bannerContent: { "en-US": "Banner 1" },
    termsAndConditions: { "en-US": "Terms 1" },
    mappings: [
      { operatorId: "op1", promotionCode: "promo1" }
    ],
    promotionMappings: [
      { operatorId: "op1", promotionCode: "promo1" }
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

describe("DataGrid", () => {
  const mockOnPageChange = jest.fn();
  const mockOnPageSizeChange = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnView = jest.fn();
  const mockOnPromotionMappingDetail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no announcements", () => {
    render(
      <DataGrid
        announcements={[]}
        currentPage={1}
        pageSize={10}
        totalItems={0}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("renders announcements with correct data", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={1}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onPromotionMappingDetail={mockOnPromotionMappingDetail}
      />
    );

    expect(screen.getByText("Promo 1")).toBeInTheDocument();
  });

  it("calls onPromotionMappingDetail when Details is clicked", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={1}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onPromotionMappingDetail={mockOnPromotionMappingDetail}
      />
    );

    const detailsLink = screen.getByText("Details");
    fireEvent.click(detailsLink);
    expect(mockOnPromotionMappingDetail).toHaveBeenCalledWith(mockAnnouncements[0].mappings);
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={1}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onPromotionMappingDetail={mockOnPromotionMappingDetail}
      />
    );

    const editButton = screen.getByLabelText("edit-announcement");
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockAnnouncements[0]);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={1}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onPromotionMappingDetail={mockOnPromotionMappingDetail}
      />
    );

    const deleteButton = screen.getByLabelText("delete-announcement");
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockAnnouncements[0]._id, mockAnnouncements[0].promotionTitle["en-US"]);
  });

  it("calls onView when view button is clicked", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={1}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onPromotionMappingDetail={mockOnPromotionMappingDetail}
      />
    );

    const viewButton = screen.getByLabelText("view-announcement");
    fireEvent.click(viewButton);
    expect(mockOnView).toHaveBeenCalledWith(mockAnnouncements[0]);
  });

  it("handles pagination correctly", async () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={2}
        pageSize={10}
        totalItems={20}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        onDelete={mockOnDelete}
      />
    );

    // Test next page
    const nextButton = screen.getByRole("button", { name: "Next page" });
    await fireEvent.click(nextButton);

    // Reset mock to clear previous calls
    mockOnPageChange.mockClear();

    // Test previous page
    const prevButton = screen.getByRole("button", { name: "Previous page" });
    await fireEvent.click(prevButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it("handles page size change", async () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={20}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        onDelete={mockOnDelete}
      />
    );

    const pageSizeSelect = screen.getByRole("combobox", { name: "Page size" });
    await fireEvent.change(pageSizeSelect, { target: { value: "20" } });
    
    // Verify the page size change callback was called with the numeric value
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(0);
  });
});
