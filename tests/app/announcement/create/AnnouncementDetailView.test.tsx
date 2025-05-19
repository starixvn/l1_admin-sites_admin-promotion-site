import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnnouncementDetailView from "../../../../src/app/announcement/create/AnnouncementDetailView";
import { Announcement } from "../../../../src/types/announcement";

const mockOperators = [
  { PartnerId: "op1", Name: "Operator 1" },
  { PartnerId: "op2", Name: "Operator 2" },
];
const mockPromotions = [
  { code: "promo1", startDate: "2024-01-01T00:00:00Z", endDate: "2024-01-10T00:00:00Z" },
  { code: "promo2", startDate: "2024-02-01T00:00:00Z", endDate: "2024-02-10T00:00:00Z" },
];

beforeEach(() => {
  if (!global.fetch) {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) }) as any;
  }
  jest.spyOn(global, "fetch").mockImplementation((input: any, _init?: RequestInit) => {
    if (typeof input === "string" && input.includes("/api/operators")) {
      return Promise.resolve({
        json: () => Promise.resolve(mockOperators),
      } as Response);
    }
    if (typeof input === "string" && input.includes("/api/promotions")) {
      return Promise.resolve({
        json: () => Promise.resolve({ items: mockPromotions }),
      } as Response);
    }
    return Promise.reject(new Error("Unknown API"));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const mockAnnouncement: Announcement = {
  _id: "test-id",
  promotionTitle: { "en-US": "Title EN", "vi-VN": "Title VI" },
  fromDate: "2024-01-01T00:00:00Z",
  toDate: "2024-01-10T00:00:00Z",
  template: 1,
  promotionMappings: [
    { operatorId: "op1", promotionCode: "promo1" },
    { operatorId: "op2", promotionCode: "promo2" },
  ],
  bannerContent: { "en-US": "Banner EN", "vi-VN": "Banner VI" },
  termsAndConditions: { "en-US": "Terms EN", "vi-VN": "Terms VI" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("AnnouncementDetailView", () => {
  it("renders all main sections and languages", async () => {
    render(<AnnouncementDetailView announcement={mockAnnouncement} onClose={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("Announcement Title")).toBeInTheDocument();
      expect(screen.getByText("Banner Template")).toBeInTheDocument();
      expect(screen.getByText("Banner Content")).toBeInTheDocument();
      expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
      expect(screen.getByText("Promotion Mapping")).toBeInTheDocument();
    });

    ["en-US", "vi-VN", "zh-CN", "zh-TW", "th-TH", "id-ID"].forEach(lang => {
      expect(screen.getAllByText(lang).length).toBeGreaterThan(0);
    });

    expect(screen.getByText("Title EN")).toBeInTheDocument();
    expect(screen.getByText("Title VI")).toBeInTheDocument();
    expect(screen.getByText("Banner EN")).toBeInTheDocument();
    expect(screen.getByText("Banner VI")).toBeInTheDocument();
    expect(screen.getByText("Terms EN")).toBeInTheDocument();
    expect(screen.getByText("Terms VI")).toBeInTheDocument();

    expect(screen.getAllByText("01/01/2024 07:00")).toHaveLength(1);
    expect(screen.getAllByText("10/01/2024 07:00")).toHaveLength(1);
  });

  it("renders correct template banner and display date", async () => {
    render(<AnnouncementDetailView announcement={mockAnnouncement} onClose={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
      expect(screen.getByText(/From/)).toBeInTheDocument();
      expect(screen.getByText(/To/)).toBeInTheDocument();
      expect(screen.getAllByText("01/01/2024 07:00")).toHaveLength(1);
      expect(screen.getAllByText("10/01/2024 07:00")).toHaveLength(1);
    });
    const img = screen.getByAltText("Banner Template") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("/template-1/banner-1.png");
  });

  it("renders promotion mappings with operator and promotion", async () => {
    render(<AnnouncementDetailView announcement={mockAnnouncement} onClose={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("Operator 1")).toBeInTheDocument();
      expect(screen.getByText("Operator 2")).toBeInTheDocument();
      expect(screen.getByText("promo1")).toBeInTheDocument();
      expect(screen.getByText("promo2")).toBeInTheDocument();
    });
  });

  it("calls onClose when Close button is clicked", async () => {
    const mockOnClose = jest.fn();
    render(<AnnouncementDetailView announcement={mockAnnouncement} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText("Close")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("renders 'No mapping' if no promotionMappings", async () => {
    const ann = { ...mockAnnouncement, promotionMappings: [] };
    render(<AnnouncementDetailView announcement={ann} onClose={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("No mapping")).toBeInTheDocument();
    });
  });
});
