import { useFormContext, FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

const LANGS = [
  { code: "en-US", label: "en-US" },
  { code: "vi-VN", label: "vi-VN" },
  { code: "zh-CN", label: "zh-CN" },
  { code: "zh-TW", label: "zh-TW" },
  { code: "th-TH", label: "th-TH" },
  { code: "id-ID", label: "id-ID" },
];

function getNestedErrorMsg(errorObj: any, key: string): string | undefined {
  if (!errorObj) return undefined;
  if (typeof errorObj === "object" && key in errorObj && errorObj[key]?.message) {
    return errorObj[key].message as string;
  }
  return undefined;
}

export default function AnnouncementStep1({ onNext }: { onNext: () => void }) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const titles = watch("titles");
  const bannerContents = watch("bannerContents");
  const terms = watch("terms");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setValue("uploadedFile", undefined);
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setValue("uploadedFile", undefined);
      e.target.value = '';
      return;
    }
    setValue("uploadedFile", file);
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
            onChange={handleFileChange}
          />
          <div className="flex items-center gap-2">
            <img src="/file.svg" alt="Download" className="w-7 h-7" />
            <a
              href="/sample-files/banner-template-sample.png"
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
      {/* Announcement Title */}
      <div className="border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-3xl mx-auto">
        <div className="font-semibold text-gray-800 mb-4 text-base">Announcement Title </div>
        <div className="flex flex-col gap-3">
          {LANGS.map((lang) => (
            <div key={lang.code} className="flex flex-col gap-1 w-full relative">
              <div className="flex items-center gap-3">
                <div className="w-24 font-medium text-gray-600 flex flex-col items-start relative">
                  {lang.label}
                  {lang.code === "en-US" && <span className="text-red-500 ml-1 absolute -top-1 right-8">*</span>}
                </div>
                <input
                  className={`flex-1 border rounded-lg px-4 py-2 text-base ${lang.code === 'en-US' && getNestedErrorMsg(errors.titles, 'en-US') ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={50}
                  value={titles?.[lang.code] || ""}
                  onChange={e => setValue(`titles.${lang.code}`, e.target.value)}
                  placeholder={`Enter title in ${lang.label}`}
                />
                <span className="text-gray-400 text-xs w-16 text-right">{(titles?.[lang.code] || "").length}/50</span>
              </div>
              {lang.code === 'en-US' && getNestedErrorMsg(errors.titles, 'en-US') && (
                <div className="text-red-500 text-xs ml-28">{getNestedErrorMsg(errors.titles, 'en-US')}</div>
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
                  className={`flex-1 border rounded-lg px-4 py-2 text-base min-h-[60px] ${lang.code === 'en-US' && getNestedErrorMsg(errors.bannerContents, 'en-US') ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={270}
                  value={bannerContents?.[lang.code] || ""}
                  onChange={e => setValue(`bannerContents.${lang.code}`, e.target.value)}
                  placeholder={`Enter banner content in ${lang.label}`}
                />
                <span className="text-gray-400 text-xs w-20 text-right pt-2">{(bannerContents?.[lang.code] || "").length}/270</span>
              </div>
              {lang.code === 'en-US' && getNestedErrorMsg(errors.bannerContents, 'en-US') && (
                <div className="text-red-500 text-xs ml-28">{getNestedErrorMsg(errors.bannerContents, 'en-US')}</div>
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
                  className={`flex-1 border rounded-lg px-4 py-2 text-base min-h-[80px] ${lang.code === 'en-US' && getNestedErrorMsg(errors.terms, 'en-US') ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={6500}
                  value={terms?.[lang.code] || ""}
                  onChange={e => setValue(`terms.${lang.code}`, e.target.value)}
                  placeholder={`Enter terms in ${lang.label}`}
                />
                <span className="text-gray-400 text-xs w-24 text-right pt-2">{(terms?.[lang.code] || "").length}/6500</span>
              </div>
              {lang.code === 'en-US' && getNestedErrorMsg(errors.terms, 'en-US') && (
                <div className="text-red-500 text-xs ml-28">{getNestedErrorMsg(errors.terms, 'en-US')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Next Button */}
      <div className="w-full max-w-3xl mx-auto flex justify-end">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2 rounded-lg font-semibold shadow transition" onClick={onNext} type="button">Next →</button>
      </div>
    </div>
  );
} 