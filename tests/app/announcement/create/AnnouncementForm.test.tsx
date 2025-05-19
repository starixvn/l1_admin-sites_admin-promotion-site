import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnnouncementForm from "../../../../src/app/announcement/create/AnnouncementForm";
import { Announcement } from "../../../../src/types/announcement";

jest.mock("../../../../src/app/announcement/create/AnnouncementStep1", () => {
  return function MockStep1({ onNext }: { onNext: () => void }) {
    const { register } = require("react-hook-form").useFormContext();
    return (
      <div data-testid="step1">
        <input data-testid="title-input" {...register("promotionTitle.en-US")} />
        <textarea data-testid="banner-input" {...register("bannerContent.en-US")} />
        <textarea data-testid="terms-input" {...register("termsAndConditions.en-US")} />
        <button onClick={onNext}>Next</button>
      </div>
    );
  };
});

jest.mock("../../../../src/app/announcement/create/AnnouncementStep2", () => {
  return function MockStep2({ onBack, onSave, mode }: { onBack: () => void; onSave: (data: any) => void; mode?: string }) {
    const { handleSubmit } = require("react-hook-form").useFormContext();
    return (
      <div data-testid="step2">
        <div>Mode: {mode}</div>
        <button onClick={onBack}>Back</button>
        <button onClick={handleSubmit(onSave)}>Save</button>
      </div>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

describe("AnnouncementForm", () => {
  const mockOnClose = jest.fn();
  const mockOnCreated = jest.fn();
  const mockInitialValues: Announcement = {
    _id: "test-id",
    promotionTitle: { "en-US": "Test Title" },
    fromDate: "2024-01-01T00:00:00Z",
    toDate: "2024-01-10T00:00:00Z",
    template: 1,
    promotionMappings: [{ operatorId: "op1", promotionCode: "code1" }],
    bannerContent: { "en-US": "Test Banner" },
    termsAndConditions: { "en-US": "Test Terms" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it("renders step 1 by default", () => {
    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    expect(screen.getByTestId("step1")).toBeInTheDocument();
    expect(screen.queryByTestId("step2")).not.toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Announcement Contents")).toBeInTheDocument();
  });

  it("moves to step 2 when next is clicked and validation passes", async () => {
    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    fireEvent.change(screen.getByTestId("title-input"), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByTestId("banner-input"), { target: { value: "Test Banner" } });
    fireEvent.change(screen.getByTestId("terms-input"), { target: { value: "Test Terms" } });
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(screen.getByTestId("step2")).toBeInTheDocument();
      expect(screen.queryByTestId("step1")).not.toBeInTheDocument();
      expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
      expect(screen.getByText("Announcement Settings")).toBeInTheDocument();
    });
  });

  it("moves back to step 1 when back is clicked", async () => {
    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    fireEvent.change(screen.getByTestId("title-input"), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByTestId("banner-input"), { target: { value: "Test Banner" } });
    fireEvent.change(screen.getByTestId("terms-input"), { target: { value: "Test Terms" } });
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(screen.getByTestId("step2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Back"));

    await waitFor(() => {
      expect(screen.getByTestId("step1")).toBeInTheDocument();
      expect(screen.queryByTestId("step2")).not.toBeInTheDocument();
    });
  });

  it("submits form in edit mode", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
        initialValues={mockInitialValues}
        mode="edit"
      />
    );

    fireEvent.change(screen.getByTestId("title-input"), { target: { value: "Updated Title" } });
    fireEvent.change(screen.getByTestId("banner-input"), { target: { value: "Updated Banner" } });
    fireEvent.change(screen.getByTestId("terms-input"), { target: { value: "Updated Terms" } });
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(screen.getByTestId("step2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/announcement/test-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
      expect(mockOnCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("handles form submission error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));
    const mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    fireEvent.change(screen.getByTestId("title-input"), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByTestId("banner-input"), { target: { value: "Test Banner" } });
    fireEvent.change(screen.getByTestId("terms-input"), { target: { value: "Test Terms" } });
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(screen.getByTestId("step2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnCreated).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    mockAlert.mockRestore();
  });

  it("initializes form with initial values", () => {
    render(
      <AnnouncementForm
        onClose={mockOnClose}
        onCreated={mockOnCreated}
        initialValues={mockInitialValues}
        mode="edit"
      />
    );

    expect(screen.getByTestId("title-input")).toHaveValue("Test Title");
    expect(screen.getByTestId("banner-input")).toHaveValue("Test Banner");
    expect(screen.getByTestId("terms-input")).toHaveValue("Test Terms");
  });
});
