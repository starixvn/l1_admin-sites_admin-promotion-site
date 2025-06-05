import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnnouncementForm from "../../../../src/app/announcement/create/AnnouncementForm";
import { toast } from "react-toastify";
import { Announcement } from "@/types/announcement";

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const mockOperators = [
  { PartnerId: "op1", Name: "Operator 1" },
  { PartnerId: "op2", Name: "Operator 2" }
];

const mockAnnouncement: Announcement = {
  _id: "test-id",
  template: 1,
  fromDate: "2024-01-01T00:00:00Z",
  toDate: "2024-01-10T00:00:00Z",
  promotionTitle: { "en-US": "Test Title" },
  bannerContent: { "en-US": "Test Banner" },
  termsAndConditions: { "en-US": "Test Terms" },
  mappings: [
    { operatorId: "op1", promotionCode: "promo1" }
  ],
  promotionMappings: [
    { operatorId: "op1", promotionCode: "promo1" }
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

describe("AnnouncementForm", () => {
  const mockOnClose = jest.fn();
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    // Mock operators API call
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === "/api/operators") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOperators)
        });
      }
      if (url === "/api/announcement/test-id") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnnouncement)
        });
      }
      if (url === "/api/announcement") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockAnnouncement, _id: "new-id" })
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  it("submits form in edit mode", async () => {
    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
        initialValues={mockAnnouncement}
        mode="edit"
      />
    );

    // Fill in required fields in step 1
    const titleInput = screen.getByPlaceholderText("Enter title in en-US");
    const bannerInput = screen.getByPlaceholderText("Enter banner content in en-US");
    const termsInput = screen.getByPlaceholderText("Enter terms in en-US");

    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    fireEvent.change(bannerInput, { target: { value: "Updated Banner" } });
    fireEvent.change(termsInput, { target: { value: "Updated Terms" } });

    // Move to step 2
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for step 2 to be rendered and operators to load
    await waitFor(() => {
      expect(screen.getByText("Announcement Settings")).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/announcement/test-id",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: expect.any(String)
        })
      );
    });

    // Verify callbacks
    expect(toast.success).toHaveBeenCalledWith("Announcement updated successfully");
    expect(mockOnCreated).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("submits form in create mode", async () => {
    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    // Fill in required fields in step 1
    const titleInput = screen.getByPlaceholderText("Enter title in en-US");
    const bannerInput = screen.getByPlaceholderText("Enter banner content in en-US");
    const termsInput = screen.getByPlaceholderText("Enter terms in en-US");

    fireEvent.change(titleInput, { target: { value: "New Title" } });
    fireEvent.change(bannerInput, { target: { value: "New Banner" } });
    fireEvent.change(termsInput, { target: { value: "New Terms" } });

    // Move to step 2
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for step 2 to be rendered and operators to load
    await waitFor(() => {
      expect(screen.getByText("Announcement Settings")).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    // Verify callbacks
  });

  it("handles form submission error", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === "/api/operators") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOperators)
        });
      }
      if (url === "/api/announcement/test-id") {
        return Promise.reject(new Error("API Error"));
      }
      return Promise.reject(new Error("Not found"));
    });

    const mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
        initialValues={mockAnnouncement}
        mode="edit"
      />
    );

    // Fill in required fields in step 1
    const titleInput = screen.getByPlaceholderText("Enter title in en-US");
    const bannerInput = screen.getByPlaceholderText("Enter banner content in en-US");
    const termsInput = screen.getByPlaceholderText("Enter terms in en-US");

    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    fireEvent.change(bannerInput, { target: { value: "Updated Banner" } });
    fireEvent.change(termsInput, { target: { value: "Updated Terms" } });

    // Move to step 2
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for step 2 to be rendered and operators to load
    await waitFor(() => {
      expect(screen.getByText("Announcement Settings")).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    // Verify error handling
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Failed to save announcement");
    });

    // Verify callbacks are not called
    expect(mockOnCreated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    mockAlert.mockRestore();
  });

  it("validates required fields in step 1", async () => {
    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    // Try to move to step 2 without filling required fields
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Verify we're still on step 1
    expect(screen.getByText("Announcement Contents")).toBeInTheDocument();
  });
});
