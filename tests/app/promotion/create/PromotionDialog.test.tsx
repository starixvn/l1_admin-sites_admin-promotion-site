import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PromotionDialog from "../../../../src/app/promotion/create/PromotionDialog";

// Mock PromotionForm component
jest.mock("../../../../src/app/promotion/create/PromotionForm", () => {
  return function MockPromotionForm({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="mock-promotion-form">
        <button onClick={onClose}>Save</button>
      </div>
    );
  };
});

// Mock Dialog component from @/components/ui/dialog
jest.mock("../../../../src/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => 
    open ? (
      <div role="dialog" data-testid="dialog">
        {children}
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
  DialogContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 className={className}>{children}</h2>
  ),
}));

describe("PromotionDialog", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog with title when open", () => {
    render(<PromotionDialog open={true} onClose={onClose} />);
    
    expect(screen.getByText("Add New Promotion")).toBeInTheDocument();
    expect(screen.getByTestId("mock-promotion-form")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<PromotionDialog open={false} onClose={onClose} />);
    
    expect(screen.queryByText("Add New Promotion")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-promotion-form")).not.toBeInTheDocument();
  });

  it("calls onClose with true when PromotionForm triggers onClose", () => {
    render(<PromotionDialog open={true} onClose={onClose} />);
    
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);
    
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("calls onClose with false when close button in Dialog is clicked", () => {
    render(<PromotionDialog open={true} onClose={onClose} />);
    // Nút Close của Dialog mock
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it("calls onClose with false when top-right close button is clicked", () => {
    render(<PromotionDialog open={true} onClose={onClose} />);
    // Nút đóng ở góc trên (aria-label='Close')
    const closeButtons = screen.getAllByLabelText("Close");
    // Lấy nút đầu tiên (của PromotionDialog)
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledWith(false);
  });
});