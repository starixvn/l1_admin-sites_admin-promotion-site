import { useFormContext } from "react-hook-form";
import Papa from "papaparse";
import React, { useRef } from "react";

const LANGS = [
  { code: "en-US", label: "en-US" },
  { code: "vi-VN", label: "vi-VN" },
  { code: "zh-CN", label: "zh-CN" },
  { code: "zh-TW", label: "zh-TW" },
  { code: "th-TH", label: "th-TH" },
  { code: "id-ID", label: "id-ID" },
];

function getNestedErrorMsg(errorObj: unknown, key: string): string | undefined {
  if (!errorObj || typeof errorObj !== "object") {
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
  const {
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const promotionTitle = watch("promotionTitle");
  const bannerContent = watch("bannerContent");
  const termsAndConditions = watch("termsAndConditions");
  const uploadedFileName = watch("uploadedFileName");

  const ERROR_BORDER_CLASS = "border-red-500";
  const ERROR_TEXT_CLASS = "text-red-500";
  const BORDER_DEFAULT_CLASS = "border-gray-300";
  const TEXT_GRAY_CLASS = "text-gray-400";
  const TERMS_AND_CONDITIONS_LABEL = "Terms & Conditions";

  // Add refs for en-US fields
  const enUsTitleRef = useRef<HTMLInputElement | null>(null);
  const enUsBannerRef = useRef<HTMLTextAreaElement | null>(null);
  const enUsTermsRef = useRef<HTMLTextAreaElement | null>(null);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const input = e.target;
    const MAX_SIZE = 2 * 1024 * 1024;

    if (!file) {
      return;
    }

    clearErrors("uploadedFile");

    // 1. Kiểm tra định dạng file
    if (!file.name.endsWith(".csv")) {
      setError("uploadedFile", {
        type: "manual",
        message: "Only .csv files are allowed!",
      });
      setValue("uploadedFile", undefined);
      setValue("uploadedFileName", "");
      input.value = "";
      return;
    }

    // 2. Kiểm tra kích thước
    if (file.size > MAX_SIZE) {
      setError("uploadedFile", {
        type: "manual",
        message: "File size must be less than 2MB!",
      });
      setValue("uploadedFile", undefined);
      setValue("uploadedFileName", "");
      input.value = "";
      return;
    }

    // 3. Parse file CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        const { data, meta } = results;

        const requiredColumns = [
          "Language",
          "Announcement Title",
          "Banner Content",
          TERMS_AND_CONDITIONS_LABEL,
        ];
        const missingColumns = requiredColumns.filter(
          (col) => !meta.fields?.includes(col)
        );

        // 4. Kiểm tra thiếu cột
        if (missingColumns.length > 0) {
          setError("uploadedFile", {
            type: "manual",
            message:
              "Upload failed. Please check your data format and try again.",
          });
          setValue("uploadedFile", undefined);
          setValue("uploadedFileName", "");
          input.value = "";
          return;
        }

        // 5. Reset toàn bộ dữ liệu cũ
        LANGS.forEach(({ code }) => {
          setValue(`promotionTitle.${code}`, "");
          setValue(`bannerContent.${code}`, "");
          setValue(`termsAndConditions.${code}`, "");
        });

        // 6. Gán dữ liệu từ file
        data.forEach((row) => {
          const lang = row["Language"]?.trim();
          if (!lang) {
            return;
          }

          const title = row["Announcement Title"]?.trim();
          const banner = row["Banner Content"]?.trim();
          const terms = row[TERMS_AND_CONDITIONS_LABEL]?.trim();

          setValue(`promotionTitle.${lang}`, title || "");
          setValue(`bannerContent.${lang}`, banner || "");
          setValue(`termsAndConditions.${lang}`, terms || "");
        });

        // 7. OK, update file info
        setValue("uploadedFile", file);
        setValue("uploadedFileName", file.name);
        input.value = "";
      },
      error: (error) => {
        console.error("PapaParse error:", error);
        setError("uploadedFile", {
          type: "manual",
          message:
            "Upload failed. Please check your data format and try again.",
        });
        setValue("uploadedFile", undefined);
        setValue("uploadedFileName", "");
        input.value = "";
      },
    });
  };

  const validateField = <T extends HTMLElement>(
    value: string | undefined,
    langCode: string,
    fieldName: string,
    ref: React.RefObject<T | null>,
    isEnglish: boolean
  ): { hasError: boolean; isFirstError: boolean } => {
    const currentValue = value || "";
    const trimmedValue = currentValue.trim();
    let hasError = false;
    let isFirstError = false;
    if (fieldName === "promotionTitle") {
      // English title: required
      if (isEnglish && !trimmedValue) {
        setError(`${fieldName}.${langCode}`, {
          type: "manual",
          message: "English title cannot be left empty.",
        });
        hasError = true;
        isFirstError = true;
      }
      // Length rule: 1–50 characters (áp dụng cho mọi ngôn ngữ nếu có nhập)
      else if (
        currentValue &&
        (currentValue.length < 1 || currentValue.length > 50)
      ) {
        setError(`${fieldName}.${langCode}`, {
          type: "manual",
          message: "Title must be between 1 and 40 characters.",
        });
        hasError = true;
        isFirstError = isEnglish; // ưu tiên focus English
      } else {
        clearErrors(`${fieldName}.${langCode}`);
      }

      return { hasError, isFirstError };
    }
    if (isEnglish && !currentValue) {
      setError(`${fieldName}.${langCode}`, {
        type: "manual",
        message: `English ${
          fieldName === "bannerContent"
            ? "banner content"
            : TERMS_AND_CONDITIONS_LABEL
        } cannot be left empty.`,
      });
      hasError = true;
      isFirstError = true;
    } else {
      clearErrors(`${fieldName}.${langCode}`);
    }

    return { hasError, isFirstError };
  };

  const validateAllFields = (): {
    hasInvalid: boolean;
    firstErrorField: HTMLElement | null;
  } => {
    let hasInvalid = false;
    let firstErrorField: HTMLElement | null = null;

    LANGS.forEach((lang) => {
      const isEnglish = lang.code === "en-US";

      // Validate title
      const { hasError: titleError, isFirstError: isFirstTitleError } =
        validateField<HTMLInputElement>(
          promotionTitle?.[lang.code],
          lang.code,
          "promotionTitle",
          enUsTitleRef,
          isEnglish
        );
      if (titleError && !firstErrorField && isFirstTitleError) {
        firstErrorField = enUsTitleRef.current;
      }
      hasInvalid = hasInvalid || titleError;

      // Validate banner content
      const { hasError: bannerError, isFirstError: isFirstBannerError } =
        validateField<HTMLTextAreaElement>(
          bannerContent?.[lang.code],
          lang.code,
          "bannerContent",
          enUsBannerRef,
          isEnglish
        );
      if (bannerError && !firstErrorField && isFirstBannerError) {
        firstErrorField = enUsBannerRef.current;
      }
      hasInvalid = hasInvalid || bannerError;

      // Validate terms and conditions
      const { hasError: termsError, isFirstError: isFirstTermsError } =
        validateField<HTMLTextAreaElement>(
          termsAndConditions?.[lang.code],
          lang.code,
          "termsAndConditions",
          enUsTermsRef,
          isEnglish
        );
      if (termsError && !firstErrorField && isFirstTermsError) {
        firstErrorField = enUsTermsRef.current;
      }
      hasInvalid = hasInvalid || termsError;
    });

    return { hasInvalid, firstErrorField };
  };

  const handleNextClick = () => {
    const { hasInvalid, firstErrorField } = validateAllFields();

    if (hasInvalid) {
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstErrorField?.focus();
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8 pb-8 max-h-[70vh] overflow-y-auto">
      {/* Upload */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Upload group */}
          <div className="flex items-center rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
            <input
              id="csv-upload-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
            <button
              type="button"
              className="flex items-center gap-2 px-4 h-10 text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border-r border-blue-200 transition"
              onClick={() =>
                document.getElementById("csv-upload-input")?.click()
              }
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 17a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3a1 1 0 1 1 2 0v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3a1 1 0 1 1 2 0v3zm7-2V5.83l3.59 3.58a1 1 0 0 0 1.41-1.41l-5.3-5.3a1 1 0 0 0-1.41 0l-5.3 5.3a1 1 0 1 0 1.41 1.41L11 5.83V15a1 1 0 1 0 2 0z" />
              </svg>
              Upload from file
            </button>
            <input
              type="text"
              className="bg-gray-50 px-4 h-10 text-sm outline-none border-0 w-107"
              value={uploadedFileName || ""}
              placeholder="No file chosen"
              readOnly
            />
          </div>
          {/* Download */}
          <div className="flex items-center gap-2 ml-auto">
            <img src="/file.svg" alt="Download" className="w-6 h-6" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-gray-700 text-xs tracking-wide">
                DOWNLOAD
              </span>
              <a
                href="/sample-files/Promotion Announcement.csv"
                download
                className="font-semibold text-[#4A90E2] text-sm hover:underline"
              >
                Sample Files
              </a>
            </div>
          </div>
        </div>
        {getNestedErrorMsg(errors, "uploadedFile") && (
          <div className="text-sm text-red-500 mt-1 ml-2">
            {getNestedErrorMsg(errors, "uploadedFile")}
          </div>
        )}
      </div>
      {/* Promotion Title */}
      <div className="border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-3xl mx-auto">
        <div className="font-semibold text-gray-800 mb-4 text-base">
          Announcement Title{" "}
        </div>
        <div className="flex flex-col gap-3">
          {LANGS.map((lang) => (
            <div
              key={lang.code}
              className="flex flex-col gap-1 w-full relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-24 font-medium text-gray-600 flex flex-col items-start relative">
                  {lang.label}
                  {lang.code === "en-US" && (
                    <span className="text-red-500 ml-1 absolute -top-1 right-8">
                      *
                    </span>
                  )}
                </div>
                <input
                  className={`flex-1 border rounded-lg px-4 py-2 text-base ${
                    getNestedErrorMsg(errors.promotionTitle, lang.code)
                      ? ERROR_BORDER_CLASS
                      : BORDER_DEFAULT_CLASS
                  }`}
                  maxLength={50}
                  value={promotionTitle?.[lang.code] || ""}
                  onChange={(e) => {
                    setValue(`promotionTitle.${lang.code}`, e.target.value);
                  }}
                  placeholder={`Enter title in ${lang.label}`}
                  ref={lang.code === "en-US" ? enUsTitleRef : undefined}
                />
                <span
                  className={`text-xs w-16 text-right ${
                    getNestedErrorMsg(
                      errors.promotionTitle,
                      lang.code
                    )?.includes("at most")
                      ? ERROR_TEXT_CLASS
                      : TEXT_GRAY_CLASS
                  }`}
                >
                  {(promotionTitle?.[lang.code] || "").length}/50
                </span>
              </div>
              {getNestedErrorMsg(errors.promotionTitle, lang.code) && (
                <div className={`${ERROR_TEXT_CLASS} text-xs ml-28`}>
                  {getNestedErrorMsg(errors.promotionTitle, lang.code)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Banner Content */}
      <div className="border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-3xl mx-auto">
        <div className="font-semibold text-gray-800 mb-4 text-base">
          Banner Content
        </div>
        <div className="space-y-3">
          {LANGS.map((lang) => (
            <div
              key={lang.code}
              className="flex flex-col gap-1 w-full relative"
            >
              <div className="flex items-start gap-3">
                <div className="w-24 font-medium text-gray-600 pt-2 flex flex-col items-start relative">
                  {lang.label}
                  {lang.code === "en-US" && (
                    <span className="text-red-500 ml-1 absolute -top-1 right-8">
                      *
                    </span>
                  )}
                </div>
                <textarea
                  className={`flex-1 border rounded-lg px-4 py-2 text-base min-h-[60px] ${
                    getNestedErrorMsg(errors.bannerContent, lang.code)
                      ? ERROR_BORDER_CLASS
                      : BORDER_DEFAULT_CLASS
                  }`}
                  maxLength={150}
                  value={bannerContent?.[lang.code] || ""}
                  onChange={(e) =>
                    setValue(`bannerContent.${lang.code}`, e.target.value)
                  }
                  placeholder={`Enter banner content in ${lang.label}`}
                  ref={lang.code === "en-US" ? enUsBannerRef : undefined}
                />
                <span
                  className={`text-xs w-20 text-right pt-2 ${
                    getNestedErrorMsg(
                      errors.bannerContent,
                      lang.code
                    )?.includes("at most")
                      ? ERROR_TEXT_CLASS
                      : TEXT_GRAY_CLASS
                  }`}
                >
                  {(bannerContent?.[lang.code] || "").length}/150
                </span>
              </div>
              {getNestedErrorMsg(errors.bannerContent, lang.code) && (
                <div className={`${ERROR_TEXT_CLASS} text-xs ml-28`}>
                  {getNestedErrorMsg(errors.bannerContent, lang.code)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Terms & Conditions */}
      <div className="border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-3xl mx-auto">
        <div className="font-semibold text-gray-800 mb-4 text-base">
          Terms & Conditions
        </div>
        <div className="space-y-3">
          {LANGS.map((lang) => (
            <div
              key={lang.code}
              className="flex flex-col gap-1 w-full relative"
            >
              <div className="flex items-start gap-3">
                <div className="w-24 font-medium text-gray-600 pt-2 flex flex-col items-start relative">
                  {lang.label}
                  {lang.code === "en-US" && (
                    <span className="text-red-500 ml-1 absolute -top-1 right-8">
                      *
                    </span>
                  )}
                </div>
                <textarea
                  className={`flex-1 border rounded-lg px-4 py-2 text-base min-h-[80px] ${
                    getNestedErrorMsg(errors.termsAndConditions, lang.code)
                      ? ERROR_BORDER_CLASS
                      : BORDER_DEFAULT_CLASS
                  }`}
                  maxLength={3000}
                  value={termsAndConditions?.[lang.code] || ""}
                  onChange={(e) =>
                    setValue(`termsAndConditions.${lang.code}`, e.target.value)
                  }
                  placeholder={`Enter terms in ${lang.label}`}
                  ref={lang.code === "en-US" ? enUsTermsRef : undefined}
                />
                <span
                  className={`text-xs w-24 text-right pt-2 ${
                    getNestedErrorMsg(
                      errors.termsAndConditions,
                      lang.code
                    )?.includes("at most")
                      ? ERROR_TEXT_CLASS
                      : TEXT_GRAY_CLASS
                  }`}
                >
                  {(termsAndConditions?.[lang.code] || "").length}/3000
                </span>
              </div>
              {getNestedErrorMsg(errors.termsAndConditions, lang.code) && (
                <div className={`${ERROR_TEXT_CLASS} text-xs ml-28`}>
                  {getNestedErrorMsg(errors.termsAndConditions, lang.code)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Next Button */}
      <div className="w-full max-w-3xl mx-auto flex justify-end">
        <button
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2 rounded-lg font-semibold shadow transition"
          onClick={handleNextClick}
          type="button"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
