import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "../../../src/app/announcement/page";
import { PromotionMapping } from "@/types/announcement";
import { Operator } from "@/types/operator";
import { Promotion } from "@/types/promotion";
import { PROMOTION_STATUS_OPTIONS } from "@/constants/promotionStatusMap";
import { ToastContainer } from "react-toastify";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockAnnouncements = Array.from({ length: 25 }, (_, i) => ({
  _id: `${i + 1}`,
  promotionTitle: { "en-US": `Test Announcement ${i + 1}` },
  bannerContent: { "en-US": `Test Banner ${i + 1}` },
  termsAndConditions: { "en-US": `Test Terms ${i + 1}` },
  fromDate: "2024-03-20T00:00:00Z",
  toDate: "2024-03-25T00:00:00Z",
  template: 1,
  mappings: [],
  createdAt: "2024-03-19T00:00:00Z",
  updatedAt: "2024-03-19T00:00:00Z"
}));

const mockOperators: Operator[] = [
  { Name: "Operator 1", PartnerId: "op1" },
  { Name: "Operator 2", PartnerId: "op2" }
];

const mockPromotions: Promotion[] = [
  {
    _id: "1",
    name: "Promotion 1",
    code: "CODE1",
    gameConfigType: 2,
    bonusItemCount: 10,
    gameIds: [1, 2],
    operatorId: "op1",
    startDate: "2024-03-20T00:00:00Z",
    endDate: "2024-03-25T00:00:00Z",
    betLevels: [],
    offeredSiteNames: [],
    currencyGroups: [],
    offeredPlayerIds: [],
    createdAt: "2024-03-19T00:00:00Z",
    updatedAt: "2024-03-19T00:00:00Z",
    status: "ACTIVE",
    __v: 0
  }
];

const mockMappings: PromotionMapping[] = [
  {
    operatorId: "op1",
    promotionCode: "CODE1"
  }
];

const mockApiResponses = {
  announcements: {
    items: mockAnnouncements,
    metadata: { total: 25, pageIndex: 1 }
  },
  operators: mockOperators,
  promotions: {
    items: mockPromotions,
    total: 1
  }
};

describe("Announcement Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockImplementation((url, options) => {
      if (options && options.method === "DELETE") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      if (typeof url === "string" && url.includes("/api/announcement")) {
        const params = new URLSearchParams(url.split('?')[1]);
        const pageIndex = parseInt(params.get('pageIndex') || '1', 10);
        const pageSize = parseInt(params.get('pageSize') || '10', 10);
        const start = (pageIndex - 1) * pageSize;
        const end = start + pageSize;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            items: mockAnnouncements.slice(start, end),
            metadata: { total: mockAnnouncements.length, pageIndex }
          })
        });
      }
      if (url === "/api/operators") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOperators)
        });
      }
      if (typeof url === "string" && url.includes("/api/promotions")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.promotions)
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  const renderPage = () => {
    return render(
      <>
        <Page />
        <ToastContainer />
      </>
    );
  };

  it("renders the announcement management page with initial data", async () => {
    await act(async () => {
      renderPage();
    });

    expect(screen.getByText("Promotion Announcement")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Announcement 1")).toBeInTheDocument();
      expect(screen.getByText("Test Announcement 2")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("handles status filter changes", async () => {
    await act(async () => {
      renderPage();
    });

    const statusSelect = screen.getByLabelText("Status");
    const submitButton = screen.getByText("Submit");
    
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: PROMOTION_STATUS_OPTIONS.Running } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("status=running")
      );
    });
  });

  it("handles pagination", async () => {
    await act(async () => {
      renderPage();
    });
    const nextButton = screen.getByLabelText("Next page");
    await act(async () => {
      fireEvent.click(nextButton);
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("pageIndex=2")
      );
    });
  });

  it("handles announcement view", async () => {
    await act(async () => {
      renderPage();
    });
    await waitFor(() => {
      expect(screen.getByText("Test Announcement 1")).toBeInTheDocument();
    });
    const viewButtons = screen.getAllByLabelText("view-announcement");
    await act(async () => {
      fireEvent.click(viewButtons[0]);
    });
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("handles promotion mapping detail view", async () => {
    const announcementsWithMappings = {
      ...mockApiResponses.announcements,
      items: [{
        ...mockAnnouncements[0],
        mappings: mockMappings
      }]
    };

    mockFetch.mockImplementationOnce((url) => {
      if (url.includes("/api/announcement")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(announcementsWithMappings)
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    await act(async () => {
      renderPage();
    });

    await waitFor(() => {
      expect(screen.getByText("Test Announcement 1")).toBeInTheDocument();
    });

    const detailLink = screen.getByText("Details");
    await act(async () => {
      fireEvent.click(detailLink);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.reject(new Error("Failed to fetch"))
    );

    await act(async () => {
      renderPage();
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    });
  });

  it("handles add new announcement", async () => {
    await act(async () => {
      renderPage();
    });

    const addButton = screen.getByText("Add New Announcement");
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("handles announcement creation success", async () => {
    await act(async () => {
      renderPage();
    });

    const addButton = screen.getByText("Add New Announcement");
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/announcement")
      );
    });
  });
});