import Papa from "papaparse";

interface Props {
  operatorId: string;
  fileName: string;
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
  fileName,
  uploadedFile,
  offeredPlayerIds,
  setShowPlayerList,
  disabled
}: Props) {
  const handleFileValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      alert("Only CSV files are allowed.");
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
          alert("CSV must contain exactly 2 columns: SiteID, PlayerID");
          e.target.value = "";
          return;
        }

        const processedData = data.map((row) => ({
          SiteID: row.SiteID,
          PlayerID:
            operatorId === "SabaPlay"
              ? `${row.SiteID}~${row.PlayerID}`
              : row.PlayerID,
        }));

        onValidFile(selectedFile, processedData);
      },
      error: (err) => {
        alert("Failed to read CSV file.");
        console.error(err);
        e.target.value = "";
      },
    });
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <label
        htmlFor="uploadedFile"
        className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-300 text-green-800 rounded-lg cursor-pointer font-medium hover:bg-green-100 transition w-40 h-11 justify-center"
      >
        <span className="mr-2 text-xl">📁</span> Choose File
      </label>
      <input
        id="uploadedFile"
        type="file"
        accept=".csv"
        disabled={disabled}
        onChange={handleFileValidation}
        className="hidden"
      />
      {offeredPlayerIds.length > 0 && (
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-300 text-green-800 rounded-lg font-medium hover:bg-green-100 transition w-40 h-11 justify-center"
          onClick={() => setShowPlayerList(true)}
        >
          Review
        </button>
      )}
      {fileName && !uploadedFile && (
        <label className="text-blue-700 text-sm mt-2">📎 {fileName}</label>
      )}
      {uploadedFile && (
        <a
          href={URL.createObjectURL(uploadedFile)}
          download={uploadedFile.name}
          className="text-blue-700 text-sm mt-2"
        >
          📎 {uploadedFile.name}
        </a>
      )}
    </div>
  );
}
