import { isSabaPlay } from "@/constants/operators";
import Papa from "papaparse";
import { useState } from "react";

interface Props {
  operatorId: string;
  uploadedFile: File | null;
  onValidFile: (
    file: File,
    data: { SiteID: string; PlayerID: string }[]
  ) => void;
  offeredPlayerIds: string[];
  setShowPlayerList: (show: boolean) => void;
  disabled: boolean;
}

export default function PlayerFileUploader({
  operatorId,
  onValidFile,
  uploadedFile,
  offeredPlayerIds,
  setShowPlayerList,
  disabled,
}: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleFileValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrorMessage(null);

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.endsWith(".csv")) {
      setErrorMessage("Upload failed. The file must be saved as a .csv file");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setErrorMessage("Upload failed. The File size cannot be bigger than 2MB");
      e.target.value = "";
      return;
    }

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, meta } = results as Papa.ParseResult<{
          SiteID: string;
          PlayerID: string;
        }>;

        const expectedHeaders = ["SiteID", "PlayerID"];
        const foundHeaders = meta.fields ?? [];

        const isValid =
          foundHeaders.length === 2 &&
          expectedHeaders.every((key) => foundHeaders.includes(key));

        if (!isValid) {
          setErrorMessage(
            "Upload failed. Please check your data format and try again"
          );
          e.target.value = "";
          return;
        }

        const processedData = data.map((row) => ({
          SiteID: row.SiteID,
          PlayerID: isSabaPlay(operatorId)
            ? `${row.SiteID}~${row.PlayerID}`
            : row.PlayerID,
        }));

        onValidFile(selectedFile, processedData);
      },
      error: (err) => {
        setErrorMessage(
          "Upload failed. Please check your data format and try again"
        );
        console.error(err);
        e.target.value = "";
      },
    });
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <label htmlFor="uploadedFile" className="btn-player-list">
        <span className="mr-1 text-md">📁</span> Choose File
      </label>
      <input
        id="uploadedFile"
        type="file"
        accept=".csv"
        disabled={disabled}
        onChange={handleFileValidation}
        className="hidden"
        data-testid="file-upload-input"
      />
      {offeredPlayerIds.length > 0 && (
        <button
          type="button"
          className="btn-player-list"
          onClick={() => setShowPlayerList(true)}
        >
          Player List
        </button>
      )}
      {uploadedFile && (
        <a
          href={URL.createObjectURL(uploadedFile)}
          download={uploadedFile.name}
          className="text-blue-700 text-sm mt-2"
        >
          {uploadedFile.name}
        </a>
      )}
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
