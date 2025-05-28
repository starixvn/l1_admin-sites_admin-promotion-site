import { Operator } from "@/types/operator";
import { Promotion } from "@/types/promotion";
import React, { useEffect, useState } from "react";
import { Announcement } from '@/types/announcement';
import { ImageIcon } from "lucide-react";
import configs from "../../../../configs";

function formatDateTime(dateStr: string) {
  if (!dateStr) {
    return "";
  }
  const date = new Date(dateStr);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

const TemplateImage = ({ template }: { template: number }) => {
  if (!configs.apiConfigurationUrl) {
    return (
      <div className="h-20 w-auto rounded bg-gray-100 flex items-center justify-center" style={{ maxWidth: 120 }}>
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={`${configs.apiConfigurationUrl}/template-${template}/banner-1.png`}
      alt="Banner Template"
      width={120}
      height={80}
      className="h-20 w-auto rounded-lg shadow border mb-2"
      style={{ maxWidth: 120 }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.parentElement?.classList.add('bg-gray-100');
        const icon = document.createElement('div');
        icon.className = 'h-20 w-auto rounded bg-gray-100 flex items-center justify-center';
        icon.style.maxWidth = '120px';
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
        target.parentElement?.appendChild(icon);
      }}
    />
  );
};

export default function AnnouncementDetailView({ announcement, onClose }: { announcement: Announcement, onClose: () => void }) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const langs = ["en-US", "vi-VN", "zh-CN", "zh-TW", "th-TH", "id-ID"];

  useEffect(() => {
    fetch("/api/operators")
      .then(res => res.json())
      .then(data => {
        setOperators(data);
      });
    fetch("/api/promotions?pageIndex=1&pageSize=1000")
      .then(res => res.json())
      .then(data => {
        const items = data.items || data.data || [];
        setPromotions(items);
      });
  }, []);

  if (!announcement) {
    return null;
  }

  return (
    <div className="pt-0 px-6 pb-6 max-h-[80vh] overflow-y-auto from-gray-50 to-white rounded-2xl text-sm">
      {/* Section: Title, Banner, Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
        {/* Announcement Title */}
        <div className="flex flex-col h-full">
          <div className="font-semibold text-base mb-2 text-gray-800 border-l-4 border-blue-500 pl-2">Announcement Title</div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm h-full flex flex-col">
            {langs.map(lang => (
              <div key={lang} className="flex gap-2 items-center mb-3">
                <span className="w-16 font-medium text-gray-500 text-xs flex items-center">{lang}</span>
                <span className="flex-1 text-gray-900 whitespace-pre-line text-sm flex items-center">{announcement.promotionTitle?.[lang] || <span className="text-gray-300">—</span>}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Banner Template + Display Date */}
        <div className="flex flex-col h-full">
          <div className="font-semibold text-base mb-2 text-gray-800 border-l-4 border-blue-500 pl-2">Banner Template</div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm h-full flex flex-col items-center justify-start">
            <TemplateImage template={announcement.template} />
            <span className="font-medium text-sm mb-3">Template {announcement.template}</span>
            <div className="w-full">
              <div className="font-semibold text-base mb-2 text-gray-800 border-l-4 border-blue-500 pl-2">Display Date (GMT+7)</div>
              <div className="flex gap-2 items-center bg-gray-50 rounded-lg border border-gray-200 p-2 shadow-sm">
                <span className="font-medium text-xs">From</span>
                <span className="bg-white border rounded px-2 py-0.5 text-gray-800 font-mono text-xs">{announcement.fromDate ? formatDateTime(announcement.fromDate) : "—"}</span>
                <span className="font-medium text-xs">To</span>
                <span className="bg-white border rounded px-2 py-0.5 text-gray-800 font-mono text-xs">{announcement.toDate ? formatDateTime(announcement.toDate) : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Banner Content */}
      <div className="mb-8">
        <div className="font-semibold text-base mb-2 text-gray-800 border-l-4 border-green-500 pl-2">Banner Content</div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          {langs.map(lang => (
            <div key={lang} className="flex gap-2 items-center mb-3">
              <span className="w-16 font-medium text-gray-500 text-xs flex items-center">{lang}</span>
              <span className="flex-1 text-gray-900 whitespace-pre-line text-sm flex items-center">{announcement.bannerContent?.[lang] || <span className="text-gray-300">—</span>}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Terms & Conditions */}
      <div className="mb-8">
        <div className="font-semibold text-base mb-2 text-gray-800 border-l-4 border-yellow-500 pl-2">Terms & Conditions</div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          {langs.map(lang => (
            <div key={lang} className="flex gap-2 items-center mb-3">
              <span className="w-16 font-medium text-gray-500 text-xs flex items-center">{lang}</span>
              <span className="flex-1 text-gray-900 whitespace-pre-line text-sm flex items-center">{announcement.termsAndConditions?.[lang] || <span className="text-gray-300">—</span>}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Promotion Mapping */}
      <div className="mb-8">
        <div className="font-semibold text-base mb-2 text-gray-800 border-l-4 border-purple-500 pl-2">Promotion Mapping</div>
        <div className="flex flex-col">
          {(announcement.promotionMappings ?? []).length > 0 ? (announcement.promotionMappings ?? []).map((m, idx) => {
            const operator = operators.find((op) => op.PartnerId === m.operatorId);
            const promotion = promotions.find((p) => p.code === m.promotionCode);
            return (
              <div
                key={idx}
                className="grid grid-cols-12 gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 mb-3 items-center min-h-[48px]"
                style={{ minWidth: 0 }}
              >
                {/* Operator badge */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 min-w-[100px] max-w-full justify-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-1 inline-block"></span>
                    <span className="truncate">{operator ? operator.Name : m.operatorId}</span>
                  </span>
                </div>
                {/* Promotion code badge */}
                <div className="col-span-5 flex items-center justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200 min-w-[160px] max-w-full justify-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 inline-block"></span>
                    <span className="truncate">{promotion ? promotion.code : m.promotionCode}</span>
                  </span>
                </div>
                {/* Date range */}
                <div className="col-span-5 flex items-center justify-center">
                  {promotion && (
                    <span className="inline-flex items-center text-xs text-gray-700 font-mono whitespace-nowrap bg-gray-50 border border-gray-200 rounded px-3 py-1 min-w-[200px] max-w-full justify-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      <span className="w-full text-center">{formatDateTime(promotion.startDate)} - {formatDateTime(promotion.endDate)}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          }) : <span className="text-gray-400">No mapping</span>}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold text-base shadow-none border-none focus:outline-none cursor-pointer"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
} 