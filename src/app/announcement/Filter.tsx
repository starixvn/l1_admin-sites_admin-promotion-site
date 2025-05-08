import React from "react";

const STATUS_OPTIONS = ["All", "Running", "Upcoming", "Completed"];

export default function Filter({ status, onStatusChange }: { status: string; onStatusChange: (status: string) => void }) {
  return (
    <form className="bg-white rounded-xl p-6 shadow-sm flex items-end gap-4">
      <div className="flex flex-col min-w-[140px]">
        <label className="text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          className="w-full h-[38px] pl-3 pr-8 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:border-black text-gray-700 cursor-pointer"
          value={status}
          onChange={e => onStatusChange(e.target.value)}
        >
          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <button type="submit" className="h-[38px] px-6 bg-[#FF5B6B] text-white rounded-lg font-medium hover:bg-[#FF4559] transition-colors border border-transparent focus:outline-none focus:border-black cursor-pointer">
        Submit
      </button>
      <button type="button" className="h-[38px] px-4 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2 border border-transparent focus:outline-none focus:border-black cursor-pointer">
        Add New Announcement
      </button>
    </form>
  );
}
