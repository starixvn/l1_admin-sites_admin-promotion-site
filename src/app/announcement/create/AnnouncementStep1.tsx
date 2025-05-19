import { useFormContext } from "react-hook-form";
import Papa from "papaparse";

const LANGS = [
  { code: "en-US", label: "en-US" },
  { code: "vi-VN", label: "vi-VN" },
  { code: "zh-CN", label: "zh-CN" },
  { code: "zh-TW", label: "zh-TW" },
  { code: "th-TH", label: "th-TH" },
  { code: "id-ID", label: "id-ID" },
];

function getNestedErrorMsg(errorObj: unknown, key: string): string | undefined {
  if (!errorObj || typeof errorObj !== "object"){
    return undefined;
  }
  // @ts-expect-error: dynamic access
  if (key in errorObj && errorObj[key]?.message) {
    // @ts-expect-error: dynamic access
    return errorObj[key].message as string;
  }
  return undefined;
}

export default function AnnouncementStep1({ onNext }: { onNext: () => void }) {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const promotionTitle = watch("promotionTitle");
  const bannerContent = watch("bannerContent");
  const termsAndConditions = watch("termsAndConditions");

  const ERROR_BORDER_CLASS = "border-red-500";
  const BORDER_DEFAULT_CLASS = "border-gray-300";

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.name.endsWith(".csv")) {
      setValue("uploadedFile", undefined);
      e.target.value = '';
      alert("Only .csv files are allowed!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setValue("uploadedFile", undefined);
      e.target.value = '';
      alert("File size must be less than 2MB!");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const { data } = results;
        data.forEach((row: Record<string, string>) => {
          const lang = row["Language"]?.trim();
          if (!lang) {
            return;
          }
          if (row["Promotion Title"]) {
            setValue(`promotionTitle.${lang}`, row["Promotion Title"]);
          }
          if (row["Banner Content"]) {
            setValue(`bannerContent.${lang}`, row["Banner Content"]);
          }
          if (row["Terms & Conditions"]) {
            setValue(`termsAndConditions.${lang}`, row["Terms & Conditions"]);
          }
        });
        setValue("uploadedFile", file);
      },
      error: () => {
        alert("Upload failed. Please check your data format and try again");
        e.target.value = "";
        setValue("uploadedFile", undefined);
      },
    });
  };

  return (
    <div className="space-y-8 pb-8 max-h-[70vh] overflow-y-auto">
      {/* Upload */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <label className="font-medium text-gray-700 whitespace-nowrap mb-0">Upload from file</label>
          <input
            type="file"
            accept=".csv"
            className="border border-gray-300 rounded-lg px-4 py-2 text-base w-full max-w-md"
            onChange={handleCsvUpload}
          />
          <div className="flex items-center gap-2">
            <img src="/file.svg" alt="Download" className="w-7 h-7" />
            <a
              href="/sample-files/promotion-announcement-template.csv"
              download
              className="leading-tight"
              style={{ textDecoration: 'none' }}
            >
              <span className="font-bold text-gray-800 text-sm" style={{letterSpacing: '0.5px'}}>DOWNLOAD</span><br />
              <span className="font-semibold text-[#4A90E2] text-base">Sample Files</span>
            </a>
          </div>
        </div>
      </div>
      {/* Promotion Title */}
      <div className="border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-3xl mx-auto">
        <div className="font-semibold text-gray-800 mb-4 text-base">Promotion Title </div>
        <div className="flex flex-col gap-3">
          {LANGS.map((lang) => (
            <div key={lang.code} className="flex flex-col gap-1 w-full relative">
              <div className="flex items-center gap-3">
                <div className="w-24 font-medium text-gray-600 flex flex-col items-start relative">
                  {lang.label}
                  {lang.code === "en-US" && <span className="text-red-500 ml-1 absolute -top-1 right-8">*</span>}
                </div>
                <input
                  className={`flex-1 border rounded-lg px-4 py-2 text-base ${lang.code === 'en-US' && getNestedErrorMsg(errors.promotionTitle, 'en-US') ? ERROR_BORDER_CLASS : BORDER_DEFAULT_CLASS}`}
                  maxLength={50}
                  value={promotionTitle?.[lang.code] || ""}
                  onChange={e => setValue(`promotionTitle.${lang.code}`, e.target.value)}
                  placeholder={`Enter title in ${lang.label}`}
                />
                <span className="text-gray-400 text-xs w-16 text-right">{(promotionTitle?.[lang.code] || "").length}/50</span>
              </div>
              {lang.code === 'en-US' && getNestedErrorMsg(errors.promotionTitle, 'en-US') && (
                <div className={`${ERROR_BORDER_CLASS} text-xs ml-28`}>{getNestedErrorMsg(errors.promotionTitle, 'en-US')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Banner Content */}
      <div className="border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-3xl mx-auto">
        <div className="font-semibold text-gray-800 mb-4 text-base">Banner Content</div>
        <div className="space-y-3">
          {LANGS.map((lang) => (
            <div key={lang.code} className="flex flex-col gap-1 w-full relative">
              <div className="flex items-start gap-3">
                <div className="w-24 font-medium text-gray-600 pt-2 flex flex-col items-start relative">
                  {lang.label}
                  {lang.code === "en-US" && <span className="text-red-500 ml-1 absolute -top-1 right-8">*</span>}
                </div>
                <textarea
                  className={`flex-1 border rounded-lg px-4 py-2 text-base min-h-[60px] ${lang.code === 'en-US' && getNestedErrorMsg(errors.bannerContent, 'en-US') ? ERROR_BORDER_CLASS : BORDER_DEFAULT_CLASS}`}
                  maxLength={270}
                  value={bannerContent?.[lang.code] || ""}
                  onChange={e => setValue(`bannerContent.${lang.code}`, e.target.value)}
                  placeholder={`Enter banner content in ${lang.label}`}
                />
                <span className="text-gray-400 text-xs w-20 text-right pt-2">{(bannerContent?.[lang.code] || "").length}/270</span>
              </div>
              {lang.code === 'en-US' && getNestedErrorMsg(errors.bannerContent, 'en-US') && (
                <div className={`${ERROR_BORDER_CLASS} text-xs ml-28`}>{getNestedErrorMsg(errors.bannerContent, 'en-US')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Terms & Conditions */}
      <div className="border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-3xl mx-auto">
        <div className="font-semibold text-gray-800 mb-4 text-base">Terms & Conditions</div>
        <div className="space-y-3">
          {LANGS.map((lang) => (
            <div key={lang.code} className="flex flex-col gap-1 w-full relative">
              <div className="flex items-start gap-3">
                <div className="w-24 font-medium text-gray-600 pt-2 flex flex-col items-start relative">
                  {lang.label}
                  {lang.code === "en-US" && <span className="text-red-500 ml-1 absolute -top-1 right-8">*</span>}
                </div>
                <textarea
                  className={`flex-1 border rounded-lg px-4 py-2 text-base min-h-[80px] ${lang.code === 'en-US' && getNestedErrorMsg(errors.termsAndConditions, 'en-US') ? ERROR_BORDER_CLASS : BORDER_DEFAULT_CLASS}`}
                  maxLength={6500}
                  value={termsAndConditions?.[lang.code] || ""}
                  onChange={e => setValue(`termsAndConditions.${lang.code}`, e.target.value)}
                  placeholder={`Enter terms in ${lang.label}`}
                />
                <span className="text-gray-400 text-xs w-24 text-right pt-2">{(termsAndConditions?.[lang.code] || "").length}/6500</span>
              </div>
              {lang.code === 'en-US' && getNestedErrorMsg(errors.termsAndConditions, 'en-US') && (
                <div className={`${ERROR_BORDER_CLASS} text-xs ml-28`}>{getNestedErrorMsg(errors.termsAndConditions, 'en-US')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Next Button */}
      <div className="w-full max-w-3xl mx-auto flex justify-end">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2 rounded-lg font-semibold shadow transition" onClick={onNext} type="button" >Next →</button>
      </div>
    </div>
  );
}