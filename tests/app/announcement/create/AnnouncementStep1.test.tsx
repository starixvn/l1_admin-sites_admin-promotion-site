import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormProvider, useForm } from "react-hook-form";
import AnnouncementStep1 from "../../../../src/app/announcement/create/AnnouncementStep1";
import Papa from "papaparse";

// Mock Papa.parse
jest.mock("papaparse", () => ({
  parse: jest.fn()
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      promotionTitle: {
        "en-US": "Test Title",
        "vi-VN": "",
        "zh-CN": "",
        "zh-TW": "",
        "th-TH": "",
        "id-ID": ""
      },
      bannerContent: {
        "en-US": "Test Banner",
        "vi-VN": "",
        "zh-CN": "",
        "zh-TW": "",
        "th-TH": "",
        "id-ID": ""
      },
      termsAndConditions: {
        "en-US": "Test Terms",
        "vi-VN": "",
        "zh-CN": "",
        "zh-TW": "",
        "th-TH": "",
        "id-ID": ""
      }
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

function renderWithForm(component: React.ReactNode) {
  return render(<Wrapper>{component}</Wrapper>);
}

describe("AnnouncementStep1", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all language fields", () => {
    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    // Announcement Title
    expect(screen.getByText("Announcement Title")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Enter title in/).length).toBe(6);
    // Banner Content
    expect(screen.getByText("Banner Content")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Enter banner content in/).length).toBe(6);
    // Terms & Conditions
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Enter terms in/).length).toBe(6);
  });

  it("calls onNext when Next button is clicked with valid data", async () => {
    const mockNext = jest.fn();
    renderWithForm(<AnnouncementStep1 onNext={mockNext} />);
    
    // Fill in required English fields
    const enTitleInput = screen.getByPlaceholderText("Enter title in en-US");
    const enBannerInput = screen.getByPlaceholderText("Enter banner content in en-US");
    const enTermsInput = screen.getByPlaceholderText("Enter terms in en-US");

    fireEvent.change(enTitleInput, { target: { value: "Test Title" } });
    fireEvent.change(enBannerInput, { target: { value: "Test Banner" } });
    fireEvent.change(enTermsInput, { target: { value: "Test Terms" } });

    fireEvent.click(screen.getByText("Next →"));
    expect(mockNext).toHaveBeenCalled();
  });

  it("uploads valid CSV and updates fields", async () => {
    const mockParse = Papa.parse as jest.Mock;
    const csvData = [
      {
        Language: "vi-VN",
        "Announcement Title": "Tiêu đề",
        "Banner Content": "Biểu ngữ",
        "Terms & Conditions": "Điều khoản"
      }
    ];

    mockParse.mockImplementation((file, options) => {
      options.complete({
        data: csvData,
        meta: { fields: ["Language", "Announcement Title", "Banner Content", "Terms & Conditions"] }
      });
    });

    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    
    const file = new File(["test"], "test.csv", { type: "text/csv" });
    const input = document.querySelector("input[type='file']");
    
    fireEvent.change(input!, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter title in vi-VN")).toHaveValue("Tiêu đề");
      expect(screen.getByPlaceholderText("Enter banner content in vi-VN")).toHaveValue("Biểu ngữ");
      expect(screen.getByPlaceholderText("Enter terms in vi-VN")).toHaveValue("Điều khoản");
    });
  });

  it("shows error for invalid file type", async () => {
    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const input = document.querySelector("input[type='file']");
    
    fireEvent.change(input!, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText("Only .csv files are allowed!")).toBeInTheDocument();
    });
  });

  it("shows error for file > 2MB", async () => {
    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    
    // Create a file larger than 2MB
    const largeFile = new File(["x".repeat(3 * 1024 * 1024)], "large.csv", { type: "text/csv" });
    const input = document.querySelector("input[type='file']");
    
    fireEvent.change(input!, { target: { files: [largeFile] } });
    
    await waitFor(() => {
      expect(screen.getByText("File size must be less than 2MB!")).toBeInTheDocument();
    });
  });
});
