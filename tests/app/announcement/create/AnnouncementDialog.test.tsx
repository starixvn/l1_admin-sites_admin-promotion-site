import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnnouncementDialog from "../../../../src/app/announcement/create/AnnouncementDialog";
import { Announcement } from "../../../../src/types/announcement";

jest.mock("../../../../src/app/announcement/create/AnnouncementForm", () => {
  return function MockAnnouncementForm({ mode, onClose, onCreated, initialValues }: any) {
    return (
      <div data-testid="mock-form">
        <div>Mode: {mode}</div>
        <button onClick={onClose}>Close Form</button>
        <button onClick={onCreated}>Create</button>
        {initialValues && <div>Initial Values: {initialValues._id}</div>}
      </div>
    );
  };
});

jest.mock("../../../../src/app/announcement/create/AnnouncementDetailView", () => {
  return function MockAnnouncementDetailView({ announcement, onClose }: any) {
    return (
      <div data-testid="mock-detail">
        <div>Viewing: {announcement._id}</div>
        <button onClick={onClose}>Close Detail</button>
      </div>
    );
  };
});

describe("AnnouncementDialog", () => {
  const mockAnnouncement: Announcement = {
    _id: "test-id",
    promotionTitle: { "en-US": "Test Title" },
    fromDate: "2024-01-01T00:00:00Z",
    toDate: "2024-01-10T00:00:00Z",
    template: 1,
    promotionMappings: [{ operatorId: "op1", promotionCode: "code1" }],
    bannerContent: { "en-US": "" },
    termsAndConditions: { "en-US": "" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnClose = jest.fn();
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders create mode correctly", () => {
    render(
      <AnnouncementDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
        mode="create"
      />
    );

    expect(screen.getByText("Add New Announcement")).toBeInTheDocument();
    expect(screen.getByTestId("mock-form")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-detail")).not.toBeInTheDocument();
  });

  it("renders edit mode correctly", () => {
    render(
      <AnnouncementDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
        announcement={mockAnnouncement}
        mode="edit"
      />
    );

    expect(screen.getByText("Edit Announcement")).toBeInTheDocument();
    expect(screen.getByTestId("mock-form")).toBeInTheDocument();
    expect(screen.getByText("Initial Values: test-id")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-detail")).not.toBeInTheDocument();
  });

  it("renders view mode correctly", () => {
    render(
      <AnnouncementDialog
        open={true}
        onClose={mockOnClose}
        announcement={mockAnnouncement}
        mode="view"
      />
    );

    expect(screen.getByText("Announcement Details")).toBeInTheDocument();
    expect(screen.getByTestId("mock-detail")).toBeInTheDocument();
    expect(screen.getByText("Viewing: test-id")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-form")).not.toBeInTheDocument();
  });

  it("does not render content when announcement is missing in view mode", () => {
    render(
      <AnnouncementDialog
        open={true}
        onClose={mockOnClose}
        mode="view"
      />
    );

    expect(screen.getByText("Announcement Details")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-detail")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-form")).not.toBeInTheDocument();
  });

  it("calls onClose when dialog is closed", () => {
    render(
      <AnnouncementDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
        mode="create"
      />
    );

    screen.getByText("Close Form").click();
    expect(mockOnClose).toHaveBeenCalled();

    mockOnClose.mockClear();

    render(
      <AnnouncementDialog
        open={true}
        onClose={mockOnClose}
        announcement={mockAnnouncement}
        mode="view"
      />
    );
    screen.getByText("Close Detail").click();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onCreated when form is submitted", () => {
    render(
      <AnnouncementDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
        mode="create"
      />
    );

    screen.getByText("Create").click();
    expect(mockOnCreated).toHaveBeenCalled();
  });
});
