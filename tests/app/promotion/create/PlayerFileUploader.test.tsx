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
  const mockFile = new File(["SiteID,PlayerID\nsite1,player1"], "test.csv", { type: "text/csv" });
  const mockInvalidFile = new File(["content"], "test.txt", { type: "text/plain" });

  beforeEach(() => {
    jest.clearAllMocks();
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

    it("should show error message if file is not CSV", () => {
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

      expect(screen.getByText("Upload failed. The file must be saved as a .csv file")).toBeInTheDocument();
      expect(onValidFile).not.toHaveBeenCalled();
      expect(mockPapaParse).not.toHaveBeenCalled();
    });

    it("should show error if CSV headers are invalid", () => {
      mockPapaParse.mockImplementation((file, options) => {
        options.complete({
          data: [],
          meta: { fields: ["InvalidHeader"] },
          errors: [],
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

      expect(screen.getByText("Upload failed. Please check your data format and try again")).toBeInTheDocument();
      expect(onValidFile).not.toHaveBeenCalled();
    });

    it("should process valid CSV file for non-Saba operator", () => {
      const validData = [
        { SiteID: "site1", PlayerID: "player1" },
        { SiteID: "site2", PlayerID: "player2" },
      ];
      mockPapaParse.mockImplementation((file, options) => {
        options.complete({
          data: validData,
          meta: { fields: ["SiteID", "PlayerID"] },
          errors: [],
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

      expect(onValidFile).toHaveBeenCalledWith(mockFile, validData);
    });

    it("should process valid CSV file for Saba operator", () => {
      const validData = [
        { SiteID: "site1", PlayerID: "player1" },
        { SiteID: "site2", PlayerID: "player2" },
      ];
      const expectedData = [
        { SiteID: "site1", PlayerID: "site1~player1" },
        { SiteID: "site2", PlayerID: "site2~player2" },
      ];

      mockPapaParse.mockImplementation((file, options) => {
        options.complete({
          data: validData,
          meta: { fields: ["SiteID", "PlayerID"] },
          errors: [],
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

      expect(onValidFile).toHaveBeenCalledWith(mockFile, expectedData);
    });

    it("should show error if Papa.parse fails", () => {
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

      expect(screen.getByText("Upload failed. Please check your data format and try again")).toBeInTheDocument();
      expect(onValidFile).not.toHaveBeenCalled();
      consoleErrorMock.mockRestore();
    });
  });
});
