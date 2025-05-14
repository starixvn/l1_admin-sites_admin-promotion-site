import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerListModal } from "@/app/promotion/create/PlayerListModal";

describe("PlayerListModal", () => {
  const mockSetShowPlayerList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when showPlayerList is false", () => {
    render(
      <PlayerListModal
        showPlayerList={false}
        setShowPlayerList={mockSetShowPlayerList}
      />
    );
    expect(screen.queryByText("Player List")).not.toBeInTheDocument();
  });

  it("should render modal when showPlayerList is true", () => {
    render(
      <PlayerListModal
        showPlayerList={true}
        setShowPlayerList={mockSetShowPlayerList}
      />
    );
    expect(screen.getByText("Player List")).toBeInTheDocument();
  });

  it("should close modal when clicking outside modal content", () => {
    render(
      <PlayerListModal
        showPlayerList={true}
        setShowPlayerList={mockSetShowPlayerList}
      />
    );
    
    // Click the backdrop (outer div with bg-white/60 class)
    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.click(backdrop);
    expect(mockSetShowPlayerList).toHaveBeenCalledWith(false);
  });

  it("should not close modal when clicking inside modal content", () => {
    render(
      <PlayerListModal
        showPlayerList={true}
        setShowPlayerList={mockSetShowPlayerList}
      />
    );
    
    // Click the modal content div
    const modalContent = screen.getByTestId("modal-content");
    fireEvent.click(modalContent);
    expect(mockSetShowPlayerList).not.toHaveBeenCalled();
  });

  it("should display player IDs in a table", () => {
    const playerIds = ["player1", "player2", "player3"];
    render(
      <PlayerListModal
        showPlayerList={true}
        setShowPlayerList={mockSetShowPlayerList}
        offeredPlayerIds={playerIds}
      />
    );

    // Check table headers
    expect(screen.getByText("No.")).toBeInTheDocument();
    expect(screen.getByText("PlayerID")).toBeInTheDocument();

    // Check player IDs are displayed
    playerIds.forEach((id, index) => {
      expect(screen.getByText(id)).toBeInTheDocument();
      expect(screen.getByText(String(index + 1))).toBeInTheDocument();
    });
  });

  it("should handle empty player IDs array", () => {
    render(
      <PlayerListModal
        showPlayerList={true}
        setShowPlayerList={mockSetShowPlayerList}
        offeredPlayerIds={[]}
      />
    );

    // Table should still be present but empty
    expect(screen.getByText("No.")).toBeInTheDocument();
    expect(screen.getByText("PlayerID")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("should handle undefined player IDs", () => {
    render(
      <PlayerListModal
        showPlayerList={true}
        setShowPlayerList={mockSetShowPlayerList}
      />
    );

    // Table should still be present but empty
    expect(screen.getByText("No.")).toBeInTheDocument();
    expect(screen.getByText("PlayerID")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });
});
