import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PlayerFileUploader from "@/app/promotion/create/PlayerFileUploader";

// Mock isSabaPlay
jest.mock("../../../../src/constants/operators", () => ({
  isSabaPlay: (id: string) => id === "saba",
}));

// Mock Papa.parse
const mockPapaParse = jest.fn();
jest.mock("papaparse", () => ({
  __esModule: true,
  default: {
    parse: (...args: any[]) => mockPapaParse(...args),
  },
}));

describe("PlayerFileUploader", () => {
  const onValidFile = jest.fn();
  const setShowPlayerList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows Player List button if offeredPlayerIds is not empty", () => {
    render(
      <PlayerFileUploader
        operatorId="op1"
        uploadedFile={null}
        onValidFile={onValidFile}
        offeredPlayerIds={["1", "2"]}
        setShowPlayerList={setShowPlayerList}
        disabled={false}
      />
    );
    expect(screen.getByText("Player List")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Player List"));
    expect(setShowPlayerList).toHaveBeenCalledWith(true);
  });
});
