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
  const mockFile = new File(["content"], "test.csv", { type: "text/csv" });
  const mockInvalidFile = new File(["content"], "test.txt", { type: "text/plain" });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock Papa.parse implementation
    mockPapaParse.mockReset();
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

  describe("handleFileValidation", () => {
    it("should do nothing if no file is selected", () => {
      render(
        <PlayerFileUploader
          operatorId="op1"
          uploadedFile={null}
          onValidFile={onValidFile}
          offeredPlayerIds={[]}
          setShowPlayerList={setShowPlayerList}
          disabled={false}
        />
      );

      const input = screen.getByTestId("file-upload-input") as HTMLInputElement;
      fireEvent.change(input, { target: { files: [] } });

      expect(onValidFile).not.toHaveBeenCalled();
      expect(mockPapaParse).not.toHaveBeenCalled();
    });

    it("should show alert and reset input if file is not CSV", () => {
      const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
      
      render(
        <PlayerFileUploader
          operatorId="op1"
          uploadedFile={null}
          onValidFile={onValidFile}
          offeredPlayerIds={[]}
          setShowPlayerList={setShowPlayerList}
          disabled={false}
        />
      );

      const input = screen.getByTestId("file-upload-input") as HTMLInputElement;
      fireEvent.change(input, { target: { files: [mockInvalidFile] } });

      expect(alertMock).toHaveBeenCalledWith("Only CSV files are allowed.");
      expect(input.value).toBe("");
      expect(onValidFile).not.toHaveBeenCalled();
      expect(mockPapaParse).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it("should show alert and reset input if CSV headers are invalid", () => {
      const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
      mockPapaParse.mockImplementation((file, options) => {
        options.complete({
          data: [],
          meta: { fields: ["InvalidHeader"] },
          errors: []
        });
      });

      render(
        <PlayerFileUploader
          operatorId="op1"
          uploadedFile={null}
          onValidFile={onValidFile}
          offeredPlayerIds={[]}
          setShowPlayerList={setShowPlayerList}
          disabled={false}
        />
      );

      const input = screen.getByTestId("file-upload-input") as HTMLInputElement;
      fireEvent.change(input, { target: { files: [mockFile] } });

      expect(alertMock).toHaveBeenCalledWith("CSV must contain exactly 2 columns: SiteID, PlayerID");
      expect(input.value).toBe("");
      expect(onValidFile).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it("should process valid CSV file for non-Saba operator", () => {
      const validData = [
        { SiteID: "site1", PlayerID: "player1" },
        { SiteID: "site2", PlayerID: "player2" }
      ];
      mockPapaParse.mockImplementation((file, options) => {
        options.complete({
          data: validData,
          meta: { fields: ["SiteID", "PlayerID"] },
          errors: []
        });
      });

      render(
        <PlayerFileUploader
          operatorId="op1"
          uploadedFile={null}
          onValidFile={onValidFile}
          offeredPlayerIds={[]}
          setShowPlayerList={setShowPlayerList}
          disabled={false}
        />
      );

      const input = screen.getByTestId("file-upload-input") as HTMLInputElement;
      fireEvent.change(input, { target: { files: [mockFile] } });

      expect(mockPapaParse).toHaveBeenCalledWith(mockFile, expect.objectContaining({
        header: true,
        skipEmptyLines: true
      }));
      expect(onValidFile).toHaveBeenCalledWith(mockFile, validData);
    });

    it("should process valid CSV file for Saba operator", () => {
      const validData = [
        { SiteID: "site1", PlayerID: "player1" },
        { SiteID: "site2", PlayerID: "player2" }
      ];
      const expectedData = [
        { SiteID: "site1", PlayerID: "site1~player1" },
        { SiteID: "site2", PlayerID: "site2~player2" }
      ];
      mockPapaParse.mockImplementation((file, options) => {
        options.complete({
          data: validData,
          meta: { fields: ["SiteID", "PlayerID"] },
          errors: []
        });
      });

      render(
        <PlayerFileUploader
          operatorId="saba"
          uploadedFile={null}
          onValidFile={onValidFile}
          offeredPlayerIds={[]}
          setShowPlayerList={setShowPlayerList}
          disabled={false}
        />
      );

      const input = screen.getByTestId("file-upload-input") as HTMLInputElement;
      fireEvent.change(input, { target: { files: [mockFile] } });

      expect(mockPapaParse).toHaveBeenCalledWith(mockFile, expect.objectContaining({
        header: true,
        skipEmptyLines: true
      }));
      expect(onValidFile).toHaveBeenCalledWith(mockFile, expectedData);
    });

    it("should handle Papa.parse error", () => {
      const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
      const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
      mockPapaParse.mockImplementation((file, options) => {
        options.error(new Error("Parse error"));
      });

      render(
        <PlayerFileUploader
          operatorId="op1"
          uploadedFile={null}
          onValidFile={onValidFile}
          offeredPlayerIds={[]}
          setShowPlayerList={setShowPlayerList}
          disabled={false}
        />
      );

      const input = screen.getByTestId("file-upload-input") as HTMLInputElement;
      fireEvent.change(input, { target: { files: [mockFile] } });

      expect(alertMock).toHaveBeenCalledWith("Failed to read CSV file.");
      expect(consoleErrorMock).toHaveBeenCalled();
      expect(input.value).toBe("");
      expect(onValidFile).not.toHaveBeenCalled();

      alertMock.mockRestore();
      consoleErrorMock.mockRestore();
    });
  });
});
