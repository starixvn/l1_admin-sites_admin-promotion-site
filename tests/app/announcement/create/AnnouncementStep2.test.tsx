import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnnouncementStep2 from "../../../../src/app/announcement/create/AnnouncementStep2";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAnnouncementSchema } from "../../../../src/app/announcement/create/announcementSchema";
import { AnnouncementFormValues } from "../../../../src/app/announcement/create/announcementSchema";

// Mock the hooks
jest.mock("@/hooks/usePromotions", () => ({
  usePromotions: () => ({
    promotions: []
  })
}));

jest.mock("@/hooks/usePromotionsUnLink", () => ({
  usePromotionsUnLink: () => ({
    promotions: []
  })
}));

// Mock fetch
global.fetch = jest.fn();

// Mock DateTimePicker component
jest.mock("@/components/custom/date-time-picker", () => {
  return function MockDateTimePicker({ value, onChange, disabled }: any) {
    return (
      <input
        data-testid="date-picker"
        type="datetime-local"
        value={value instanceof Date ? value.toISOString().slice(0, 16) : value}
        onChange={(e) => onChange?.(new Date(e.target.value))}
        disabled={disabled}
      />
    );
  };
});

const FormWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: Partial<AnnouncementFormValues> }) => {
  const methods = useForm<AnnouncementFormValues>({
    resolver: zodResolver(getAnnouncementSchema(false)),
    defaultValues: {
      promotionTitle: { "en-US": "" },
      bannerContent: { "en-US": "" },
      termsAndConditions: { "en-US": "" },
      template: undefined,
      fromDate: new Date("2024-01-01T00:00:00"),
      toDate: new Date("2024-01-10T00:00:00"),
      promotionMappings: [],
      ...defaultValues
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("AnnouncementStep2", () => {
  const mockOnBack = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === "/api/operators") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { PartnerId: "op1", Name: "Operator 1" },
            { PartnerId: "op2", Name: "Operator 2" }
          ])
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  it("renders form fields correctly", async () => {
    render(
      <FormWrapper>
        <AnnouncementStep2
          onBack={mockOnBack}
          onSave={mockOnSave}
          mode="create"
        />
      </FormWrapper>
    );

    // Wait for operators to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    expect(screen.getByText("Banner Template")).toBeInTheDocument();
    expect(screen.getByText("Display Date (GMT+7)")).toBeInTheDocument();
    expect(screen.getByText("Promotion Mapping")).toBeInTheDocument();
    expect(screen.getByText("Add Promotion")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("shows validation errors when required fields are empty", async () => {
    render(
      <FormWrapper>
        <AnnouncementStep2
          onBack={mockOnBack}
          onSave={mockOnSave}
          mode="create"
        />
      </FormWrapper>
    );

    // Wait for operators to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    // Click save without filling required fields
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    
    await waitFor(() => {
      expect(screen.getByText("Required")).toBeInTheDocument();
      expect(screen.getByText("The Announcement must be linked to at least one Promotion code")).toBeInTheDocument();
    });

    // Verify onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("handles back button click", async () => {
    render(
      <FormWrapper>
        <AnnouncementStep2
          onBack={mockOnBack}
          onSave={mockOnSave}
          mode="create"
        />
      </FormWrapper>
    );

    // Wait for operators to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it("adds and removes promotion mappings", async () => {
    render(
      <FormWrapper>
        <AnnouncementStep2
          onBack={mockOnBack}
          onSave={mockOnSave}
          mode="create"
        />
      </FormWrapper>
    );

    // Wait for operators to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    // Add a promotion mapping
    fireEvent.click(screen.getByText("Add Promotion"));
    
    // Verify the mapping was added
    const operatorSelect = screen.getByRole("combobox", { name: "Select Operator" });
    expect(operatorSelect).toBeInTheDocument();

    // Remove the mapping
    const removeButton = screen.getByRole("button", { name: "×" });
    fireEvent.click(removeButton);

    // Verify the mapping was removed
    expect(screen.queryByRole("combobox", { name: "Select Operator" })).not.toBeInTheDocument();
  });

  it("disables fields in edit mode when announcement is not editable", async () => {
    render(
      <FormWrapper>
        <AnnouncementStep2
          onBack={mockOnBack}
          onSave={mockOnSave}
          mode="edit"
          status="running"
        />
      </FormWrapper>
    );

    // Wait for operators to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    // Add a promotion mapping
    fireEvent.click(screen.getByText("Add Promotion"));

    // Verify fields are disabled
    const datePickers = screen.getAllByTestId("date-picker");
    datePickers.forEach(picker => {
      expect(picker).toBeDisabled();
    });

    const addButton = screen.getByText("Add Promotion");
    expect(addButton).toHaveClass("cursor-not-allowed");
  });

  it("submits form with valid data", async () => {
    render(
      <FormWrapper defaultValues={{
        template: 1,
        promotionMappings: [
          { operatorId: "op1", promotionCode: "promo1" }
        ]
      }}>
        <AnnouncementStep2
          onBack={mockOnBack}
          onSave={mockOnSave}
          mode="create"
        />
      </FormWrapper>
    );

    // Wait for operators to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/operators");
    });

    // Click save
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Verify onSave was called
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });
});
