import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import AnnouncementForm from "./AnnouncementForm";

const TABS = [
  { key: "display", label: "Display Contents" },
  { key: "banner", label: "Banner & Settings" },
];

const LANGS = [
  { code: "en-US", label: "en-US" },
  { code: "vi-VN", label: "vi-VN" },
  { code: "zh-CN", label: "zh-CN" },
  { code: "zh-TW", label: "zh-TW" },
  { code: "th-TH", label: "th-TH" },
  { code: "id-ID", label: "id-ID" },
];

export default function AnnouncementDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState("display");
  const [titles, setTitles] = useState({ "en-US": "Hot Slots - Hot Offers Promotion" });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[850px] max-w-[72rem] p-0 bg-white rounded-2xl shadow-2xl border-0 max-h-[100vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Add New Announcement</h2>
        </div>
        {/* Stepper & Form */}
        <AnnouncementForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

function DisplayContentsTab({ titles, setTitles }: any) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Upload & Download */}
      <div className="w-full max-w-xl mx-auto mb-6 bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex flex-col flex-1 gap-2 w-full">
          <label className="font-medium text-gray-700">Upload from file</label>
          <div className="flex items-center gap-2 w-full">
            <input type="file" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 w-full max-w-xs" />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold transition w-full max-w-[120px]">Import</button>
          </div>
        </div>
        <a
          href="#"
          className="flex items-center gap-2 text-emerald-600 font-medium hover:underline transition whitespace-nowrap"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4m-9 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Download Sample Files
        </a>
      </div>
      {/* Title Multi-language */}
      <div className="w-full max-w-xl mx-auto mb-6 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="font-semibold text-gray-800 mb-4 text-base">
          Announcement Title <span className="text-red-500">*</span>
        </div>
        <div className="space-y-3 w-full">
          {LANGS.map((lang) => (
            <div key={lang.code} className="flex items-center gap-3 w-full">
              <div className="w-20 font-medium text-gray-600">{lang.label}</div>
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 w-full"
                maxLength={50}
                value={titles[lang.code] || ""}
                onChange={e => setTitles((prev: any) => ({ ...prev, [lang.code]: e.target.value }))}
                placeholder={`Enter title in ${lang.label}`}
              />
              <span className="text-gray-400 text-xs w-12 text-right">{(titles[lang.code] || "").length}/50</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BannerSettingsTab({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner */}
      <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col gap-2 mb-6">
        <div className="font-semibold text-gray-800 mb-2">Banner Template <span className="text-red-500">*</span></div>
        <div className="flex items-center gap-6 w-full">
          <img
            src="https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg"
            alt="banner"
            className="w-44 h-24 rounded-lg object-cover border"
          />
          <div className="text-gray-700 font-medium">Template 1</div>
        </div>
      </div>
      {/* Date */}
      <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col gap-2 mb-6">
        <div className="font-semibold text-gray-800 mb-2">Display Date (GMT+7) <span className="text-red-500">*</span></div>
        <div className="flex items-center gap-3 w-full">
          <input type="datetime-local" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 w-full max-w-xs" />
          <span className="text-gray-500">to</span>
          <input type="datetime-local" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 w-full max-w-xs" />
        </div>
      </div>
      {/* Promotion Mapping */}
      <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col gap-2 mb-6">
        <div className="font-semibold text-gray-800 mb-2">Promotion Mapping <span className="text-red-500">*</span></div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 w-full flex-wrap">
            <span className="bg-gray-200 px-3 py-1 rounded-lg text-gray-700 font-medium">ONEwork_VG</span>
            <span className="bg-gray-200 px-3 py-1 rounded-lg text-gray-700 font-medium">Summer_FSB</span>
            <span className="text-xs text-gray-500">(From 25/04/2025 09:00 to 15/05/2025 23:59)</span>
          </div>
          <div className="flex items-center gap-2 w-full flex-wrap">
            <span className="bg-gray-200 px-3 py-1 rounded-lg text-gray-700 font-medium">1W_Cash</span>
            <span className="bg-gray-200 px-3 py-1 rounded-lg text-gray-700 font-medium">FSB_for_all_slots</span>
            <span className="text-xs text-gray-500">(From 25/04/2025 09:00 to 15/05/2025 23:59)</span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="w-full max-w-xl mx-auto flex justify-end gap-3 pt-2">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-7 py-2 rounded-lg font-semibold shadow transition">Preview</button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-7 py-2 rounded-lg font-semibold shadow transition" onClick={onClose}>Close</button>
      </div>
    </div>
  );
} 