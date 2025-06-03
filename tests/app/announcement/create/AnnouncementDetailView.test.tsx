import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnnouncementDetailView from "../../../../src/app/announcement/create/AnnouncementDetailView";
import { Announcement } from "../../../../src/types/announcement";

// Mock fetch for operators and promotions
global.fetch = jest.fn();

const mockOperators = [
  { PartnerId: "op1", Name: "Operator 1" },
  { PartnerId: "op2", Name: "Operator 2" }
];

const mockPromotions = [
  { 
    code: "promo1", 
    name: "Promo 1", 
    operatorId: "op1", 
    startDate: "2024-01-01T00:00:00Z", 
    endDate: "2024-01-10T00:00:00Z" 
  },
  { 
    code: "promo2", 
    name: "Promo 2", 
    operatorId: "op2", 
    startDate: "2024-02-01T00:00:00Z", 
    endDate: "2024-02-10T00:00:00Z" 
  }
];

const mockAnnouncement: Announcement = {
  _id: "1",
  template: 1,
  fromDate: "2024-01-01T00:00:00Z",
  toDate: "2024-01-10T00:00:00Z",
  promotionTitle: {
    "en-US": "Title EN",
    "vi-VN": "Title VI"
  },
  bannerContent: {
    "en-US": "Banner EN",
    "vi-VN": "Banner VI"
  },
  termsAndConditions: {
    "en-US": "Terms EN",
    "vi-VN": "Terms VI"
  },
  mappings: [
    { operatorId: "op1", promotionCode: "promo1" },
    { operatorId: "op2", promotionCode: "promo2" }
  ],
  promotionMappings: [
    { operatorId: "op1", promotionCode: "promo1" },
    { operatorId: "op2", promotionCode: "promo2" }
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

describe("AnnouncementDetailView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === "/api/operators") {
        return Promise.resolve({
          json: () => Promise.resolve(mockOperators)
        });
      }
      if (url === "/api/promotions?pageIndex=1&pageSize=1000") {
        return Promise.resolve({
          json: () => Promise.resolve({ items: mockPromotions })
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  it("renders announcement details correctly", async () => {
    render(<AnnouncementDetailView announcement={mockAnnouncement} onClose={jest.fn()} />);

    // Check title section
    expect(screen.getByText("Announcement Title")).toBeInTheDocument();
    expect(screen.getByText("Title EN")).toBeInTheDocument();
    expect(screen.getByText("Title VI")).toBeInTheDocument();

    // Check banner content section
    expect(screen.getByText("Banner Content")).toBeInTheDocument();
    expect(screen.getByText("Banner EN")).toBeInTheDocument();
    expect(screen.getByText("Banner VI")).toBeInTheDocument();

    // Check terms section
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
    expect(screen.getByText("Terms EN")).toBeInTheDocument();
    expect(screen.getByText("Terms VI")).toBeInTheDocument();
  });

  it("renders promotion mappings with operator and promotion", async () => {
    render(<AnnouncementDetailView announcement={mockAnnouncement} onClose={jest.fn()} />);

    // Wait for the operators and promotions to be loaded
    await waitFor(() => {
      // Check if the promotion mappings section exists
      expect(screen.getByText("Promotion Mapping")).toBeInTheDocument();
    });

    // Check for operator names within their badges
    const operatorBadges = screen.getAllByText(/Operator \d/);
    expect(operatorBadges).toHaveLength(2);
    expect(operatorBadges[0]).toHaveTextContent("Operator 1");
    expect(operatorBadges[1]).toHaveTextContent("Operator 2");

    // Check for promotion codes within their badges
    const promotionBadges = screen.getAllByText(/promo\d/);
    expect(promotionBadges).toHaveLength(2);
    expect(promotionBadges[0]).toHaveTextContent("promo1");
    expect(promotionBadges[1]).toHaveTextContent("promo2");

    // Check for date ranges using more specific selectors
    const dateRangeElements = screen.getAllByText(/01\/01\/2024.*10\/01\/2024/);
    expect(dateRangeElements).toHaveLength(1);
    expect(dateRangeElements[0]).toHaveTextContent("01/01/2024 07:00 - 10/01/2024 07:00");
  });

  it("shows no mapping message when mappings are empty", async () => {
    const announcementWithoutMappings: Announcement = {
      ...mockAnnouncement,
      mappings: [],
      promotionMappings: []
    };

    render(<AnnouncementDetailView announcement={announcementWithoutMappings} onClose={jest.fn()} />);

    // Wait for the promotion mappings section to be rendered
    await waitFor(() => {
      expect(screen.getByText("Promotion Mapping")).toBeInTheDocument();
    });

    // Check for the no mapping message using a more specific selector
    const noMappingElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             element?.className === 'text-gray-400' && 
             content === 'No mapping';
    });
    expect(noMappingElement).toBeInTheDocument();
  });

  it("handles missing operator or promotion data gracefully", async () => {
    const announcementWithInvalidMapping = {
      ...mockAnnouncement,
      mappings: [
        { operatorId: "invalid-op", promotionCode: "invalid-promo" }
      ]
    };

    render(<AnnouncementDetailView announcement={announcementWithInvalidMapping} onClose={jest.fn()} />);

    await waitFor(() => {
      // Should still show the operator ID and promotion code even if not found
      expect(screen.getByText("invalid-op")).toBeInTheDocument();
      expect(screen.getByText("invalid-promo")).toBeInTheDocument();
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
});
