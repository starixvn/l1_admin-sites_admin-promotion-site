import Papa from "papaparse";

interface Props {
  operatorId: string;
  fileName: string;
  uploadedFile: File | null;
  onValidFile: (
    file: File,
    data: { SiteID: string; PlayerID: string }[]
  ) => void;
}

export default function PlayerFileUploader({
  operatorId,
  onValidFile,
  fileName,
  uploadedFile,
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
    <div className="space-y-2 mt-2">
      <label
        htmlFor="uploadedFile"
        className="upload-file cursor-pointer inline-block"
      >
        📁 Choose File
      </label>
      <input
        id="uploadedFile"
        type="file"
        accept=".csv"
        onChange={handleFileValidation}
        className="hidden"
      />
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
