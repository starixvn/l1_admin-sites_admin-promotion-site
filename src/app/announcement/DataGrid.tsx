import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { PROMOTION_STATUS_OPTIONS } from "@/constants/promotionStatusMap";
import { PAGE_SIZE_OPTIONS } from "@/constants/constants";
import configs from "../../../configs";
import { Announcement, PromotionMapping } from "@/types/announcement";

export function getStatusStyle(status: string) {
  switch (status) {
    case PROMOTION_STATUS_OPTIONS.Running:
      return "bg-green-100 text-green-800";
    case PROMOTION_STATUS_OPTIONS.Upcoming:
      return "bg-yellow-100 text-yellow-800";
    case PROMOTION_STATUS_OPTIONS.Completed:
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

interface DataGridProps {
  announcements: Announcement[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDelete: (id: string, title: string) => void;
  onEdit?: (announcement: Announcement) => void;
  onView?: (announcement: Announcement) => void;
  onPromotionMappingDetail?: (mappings: PromotionMapping[]) => void;
}

function getAnnouncementStatus(fromDate: string, toDate: string): string {
  const now = new Date();
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (now < from) {
    return PROMOTION_STATUS_OPTIONS.Upcoming;
  }
  if (now > to) {
    return PROMOTION_STATUS_OPTIONS.Completed;
  }
  return PROMOTION_STATUS_OPTIONS.Running;
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DataGrid({ announcements, currentPage, pageSize, totalItems, onPageChange, onPageSizeChange, onDelete, onEdit, onView, onPromotionMappingDetail }: DataGridProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="w-[4%] min-w-[40px] px-4 py-3 text-center font-semibold">No.</th>
            <th className="w-[22%] min-w-[200px] px-4 py-3 text-left font-semibold">Announcement Title</th>
            <th className="w-[16%] min-w-[160px] px-4 py-3 text-center font-semibold">Display Date (GMT + 7)</th>
            <th className="w-[12%] min-w-[120px] px-4 py-3 text-center font-semibold">Banner Template</th>
            <th className="w-[16%] min-w-[140px] px-4 py-3 text-center font-semibold">Promotion Mapping</th>
            <th className="w-[10%] min-w-[100px] px-4 py-3 text-center font-semibold">Status</th>
            <th className="w-[8%] min-w-[80px] px-4 py-3 text-center font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {announcements.map((a, idx) => {
            const status = getAnnouncementStatus(a.fromDate, a.toDate);
            return (
              <tr key={a._id} className="hover:bg-green-50">
                <td className="px-4 py-4 text-center">{(currentPage - 1) * pageSize + idx + 1}</td>
                <td className="px-4 py-4 text-gray-800 truncate">{a.promotionTitle?.['en-US']}</td>
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1 gap-1 shadow-sm transition hover:border-blue-300">
                    <svg className="w-4 h-4 text-blue-300 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="5"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    <span className="font-mono text-xs text-gray-900 font-semibold text-center">{formatDateTime(a.fromDate)}</span>
                    <span className="mx-1 text-gray-300 font-bold">-</span>
                    <span className="font-mono text-xs text-gray-900 font-semibold text-center">{formatDateTime(a.toDate)}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <img
                    src={`${configs.apiConfigurationUrl}/template-${a.template}/banner-1.png`}
                    alt="Banner Template"
                    className="h-12 w-auto rounded shadow object-contain border mx-auto"
                    style={{ maxWidth: 100 }}
                  />
                </td>
                <td className="px-4 py-4 text-center text-blue-500 cursor-pointer truncate" onClick={() => onPromotionMappingDetail && onPromotionMappingDetail(a.promotionMappings)}>
                  Detail
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>{status}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button className="p-1 rounded-full transition-colors group" aria-label="view-announcement" onClick={() => onView && onView(a)}>
                      <Eye className="w-4 h-4 text-gray-600 group-hover:text-black group-hover:bg-gray-200 rounded-full transition-colors" />
                    </button>
                    {status === PROMOTION_STATUS_OPTIONS.Upcoming && (
                      <>
                        <button className="p-1 rounded-full transition-colors group" aria-label="edit-announcement" onClick={() => onEdit && onEdit(a)}>
                          <Pencil className="w-4 h-4 text-blue-600 group-hover:bg-gray-200 rounded-full transition-colors" />
                        </button>
                        <button className="p-1 rounded-full transition-colors group" aria-label="delete-announcement" onClick={() => onDelete(a._id, a.promotionTitle?.['en-US'] || '')}>
                          <Trash2 className="w-4 h-4 text-red-500 group-hover:bg-gray-200 rounded-full transition-colors" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination UI */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 text-sm text-gray-500 gap-2">
        <div>
          <span>
            Showing {announcements.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            {" "}to{" "}
            <span className="font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span>
            {" "}of{" "}
            <span className="font-semibold">{totalItems}</span> results
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-50"
              aria-label="Previous page"
            >
              <span className="sr-only">Previous</span>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
              )
              .map((page, idx, arr) => {
                // Add dots if needed
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  return (
                    <span
                      key={`dots-${page}`}
                      className="px-2 text-gray-400 select-none"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border transition
                      ${
                        page === currentPage
                          ? "bg-blue-600 text-white border-blue-600 font-bold shadow"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                      }
                    `}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-50"
              aria-label="Next page"
            >
              <span className="sr-only">Next</span>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <label className="flex items-center gap-1 ml-4">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
