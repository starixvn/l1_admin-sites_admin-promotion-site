import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataGrid from "../../../src/app/announcement/DataGrid";
import { Announcement, PromotionMapping } from "../../../src/types/announcement";
import { PROMOTION_STATUS_OPTIONS } from "../../../src/constants/promotionStatusMap";

const mockAnnouncements: Announcement[] = [
  {
    _id: "1",
    promotionTitle: { "en-US": "Promo 1" },
    fromDate: "2099-01-01T00:00:00Z", // Upcoming
    toDate: "2099-01-10T00:00:00Z",
    template: 1,
    promotionMappings: [{ operatorId: "op1", promotionCode: "code1" }],
    bannerContent: { "en-US": "" },
    termsAndConditions: { "en-US": "" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    promotionTitle: { "en-US": "Promo 2" },
    fromDate: "2000-01-01T00:00:00Z", // Completed
    toDate: "2000-01-10T00:00:00Z",
    template: 2,
    promotionMappings: [{ operatorId: "op2", promotionCode: "code2" }],
    bannerContent: { "en-US": "" },
    termsAndConditions: { "en-US": "" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("DataGrid", () => {
  const onPageChange = jest.fn();
  const onPageSizeChange = jest.fn();
  const onDelete = jest.fn();
  const onEdit = jest.fn();
  const onView = jest.fn();
  const onPromotionMappingDetail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correct number of rows and columns", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={2}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        onPromotionMappingDetail={onPromotionMappingDetail}
      />
    );
    expect(screen.getAllByRole("row")).toHaveLength(3); // 1 header + 2 data
    expect(screen.getByText("Promo 1")).toBeInTheDocument();
    expect(screen.getByText("Promo 2")).toBeInTheDocument();
  });

  it("shows correct status for each announcement", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={2}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        onPromotionMappingDetail={onPromotionMappingDetail}
      />
    );
    expect(screen.getByText(PROMOTION_STATUS_OPTIONS.Upcoming)).toBeInTheDocument();
    expect(screen.getByText(PROMOTION_STATUS_OPTIONS.Completed)).toBeInTheDocument();
  });

  it("calls onView when view button is clicked", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={2}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        onPromotionMappingDetail={onPromotionMappingDetail}
      />
    );
    const viewButtons = screen.getAllByLabelText("view-announcement");
    fireEvent.click(viewButtons[0]);
    expect(onView).toHaveBeenCalledWith(mockAnnouncements[0]);
  });

  it("calls onEdit and onDelete only for Upcoming status", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={2}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        onPromotionMappingDetail={onPromotionMappingDetail}
      />
    );
    const editButtons = screen.getAllByLabelText("edit-announcement");
    const deleteButtons = screen.getAllByLabelText("delete-announcement");
    expect(editButtons).toHaveLength(1);
    expect(deleteButtons).toHaveLength(1);

    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(mockAnnouncements[0]);
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith("1", "Promo 1");
  });

  it("calls onPromotionMappingDetail when detail is clicked", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={1}
        pageSize={10}
        totalItems={2}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        onPromotionMappingDetail={onPromotionMappingDetail}
      />
    );
    const detailCells = screen.getAllByText("Detail");
    fireEvent.click(detailCells[0]);
    expect(onPromotionMappingDetail).toHaveBeenCalledWith(mockAnnouncements[0].promotionMappings);
  });

  it("calls onPageChange when pagination buttons are clicked", () => {
    render(
      <DataGrid
        announcements={mockAnnouncements}
        currentPage={2}
        pageSize={1}
        totalItems={2}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        onPromotionMappingDetail={onPromotionMappingDetail}
      />
    );
    const prevButton = screen.getByLabelText("Previous page");
    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
