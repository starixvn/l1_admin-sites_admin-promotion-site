import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PromotionMappingDialog from "../../../../src/app/announcement/create/PromotionMappingDialog";

const mockOperators = [
  { PartnerId: "op1", Name: "Operator 1" },
  { PartnerId: "op2", Name: "Operator 2" },
];
const mockPromotions = [
  { code: "promo1", name: "Promo 1", startDate: "2024-01-01T00:00:00Z", endDate: "2024-01-10T00:00:00Z" },
  { code: "promo2", name: "Promo 2", startDate: "2024-02-01T00:00:00Z", endDate: "2024-02-10T00:00:00Z" },
];

describe("PromotionMappingDialog", () => {
  it("renders dialog with mappings", () => {
    render(
      <PromotionMappingDialog
        open={true}
        onClose={jest.fn()}
        mappings={[
          { operatorId: "op1", promotionCode: "promo1" },
          { operatorId: "op2", promotionCode: "promo2" },
        ]}
        operators={mockOperators}
        promotions={mockPromotions}
      />
    );

    expect(screen.getByText("Promotion Mapping")).toBeInTheDocument();
    expect(screen.getByText("Operator 1")).toBeInTheDocument();
    expect(screen.getByText("Operator 2")).toBeInTheDocument();
    expect(screen.getByText("promo1")).toBeInTheDocument();
    expect(screen.getByText("promo2")).toBeInTheDocument();
  });

  it("renders 'No mapping' if mappings is empty", () => {
    render(
      <PromotionMappingDialog
        open={true}
        onClose={jest.fn()}
        mappings={[]}
        operators={mockOperators}
        promotions={mockPromotions}
      />
    );
    expect(screen.getByText("No mapping")).toBeInTheDocument();
  });

  it("calls onClose when Close button is clicked", () => {
    const mockOnClose = jest.fn();
    render(
      <PromotionMappingDialog
        open={true}
        onClose={mockOnClose}
        mappings={[
          { operatorId: "op1", promotionCode: "promo1" }
        ]}
        operators={mockOperators}
        promotions={mockPromotions}
      />
    );
    const closeButtons = screen.getAllByText("Close");
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows operatorId and promotionCode if not found in list", () => {
    render(
      <PromotionMappingDialog
        open={true}
        onClose={jest.fn()}
        mappings={[
          { operatorId: "notfound", promotionCode: "notfound" }
        ]}
        operators={mockOperators}
        promotions={mockPromotions}
      />
    );
    const notfoundEls = screen.getAllByText("notfound");
    expect(notfoundEls.length).toBeGreaterThanOrEqual(2);
  });
});
