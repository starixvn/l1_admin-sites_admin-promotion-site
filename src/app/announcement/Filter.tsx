import { PROMOTION_STATUS_OPTIONS_LIST } from "@/constants/promotionStatusMap";
import React from "react";

const STATUS_OPTIONS = ["All", "Running", "Upcoming", "Completed"];

export default function Filter({ status, onStatusChange }: { status: string; onStatusChange: (status: string) => void }) {
  return (
    <form className="bg-white rounded-xl p-6 shadow-sm flex items-end gap-4">
<div className="flex flex-col min-w-[140px]">
          <label htmlFor="status-select" className="text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="relative">
            <select
              id="status-select"
              name="status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full h-[38px] pl-3 pr-8 border border-gray-300 rounded-lg bg-white
              appearance-none focus:outline-none focus:border-black
              text-gray-700 cursor-pointer"
              aria-label="Status"
            >
              {PROMOTION_STATUS_OPTIONS_LIST.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1.41 0.590088L6 5.17009L10.59 0.590088L12 2.00009L6 8.00009L0 2.00009L1.41 0.590088Z"
                  fill="#6B7280"
                />
              </svg>
            </div>
          </div>
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
