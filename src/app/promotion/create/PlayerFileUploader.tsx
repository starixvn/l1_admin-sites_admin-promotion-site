import { useState } from "react";
import Papa from "papaparse";

interface Props {
  onValidFile: (
    file: File,
    data: { SiteID: string; PlayerID: string }[]
  ) => void;
}

export default function PlayerFileUploader({ onValidFile }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    debugger;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Only CSV files are allowed.");
      e.target.value = "";
      return;
    }

    Papa.parse(file, {
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

        setFileName(file.name);
        onValidFile(file, data);
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
      {fileName && <p className="text-sm text-blue-700 mt-1">{fileName}</p>}
      <a
        href="/sample-files/player-list-template.csv"
        download
        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm font-medium"
      >
        📥 Download Sample File
      </a>
    </div>
  );
}
