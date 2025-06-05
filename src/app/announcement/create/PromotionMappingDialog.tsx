import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Mapping {
  operatorId: string;
  promotionCode: string;
}
interface Operator { PartnerId: string; Name: string; }
interface Promotion { code: string; name: string; startDate: string; endDate: string; }

function formatDateTime(dateStr: string) {
  if (!dateStr) {
    return "";
  }
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PromotionMappingDialog({ open, onClose, mappings, operators, promotions }: {
  open: boolean;
  onClose: () => void;
  mappings: Mapping[];
  operators: Operator[];
  promotions: Promotion[];
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className="min-w-[800px] max-w-2xl w-full p-0 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="px-8 pt-8 pb-4 border-b flex items-center justify-between">
          <DialogTitle asChild>
            <h2 className="text-2xl font-bold text-gray-900">Promotion Mapping</h2>
          </DialogTitle>
        </div>
        <div className="px-8">
          <div className="flex flex-col">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 font-semibold text-gray-800 text-base  rounded-t-2xl ">
              <div className="col-span-3 flex items-center justify-center">Operator</div>
              <div className="col-span-4 flex items-center justify-center">Promotion Code</div>
            </div>
            {mappings.length === 0 && <div className="text-gray-400">No mapping</div>}
            {mappings.map((m, idx) => {
              const operator = operators.find(o => o.PartnerId === m.operatorId);
              const promotion = promotions.find(p => p.code === m.promotionCode);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 mb-3 items-center min-h-[48px]"
                  style={{ minWidth: 0 }}
                >
                  {/* Operator badge */}
                  <div className="col-span-3 flex items-center justify-center">
                    <span className="inline-flex w-[200px] items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 min-w-[100px] max-w-full justify-center">
                      <span className="truncate">{operator ? operator.Name : m.operatorId}</span>
                    </span>
                  </div>
                  {/* Promotion code badge */}
                  <div className="col-span-4 flex items-center justify-center">
                    <span className="inline-flex w-[200px] items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200 min-w-[160px] max-w-full justify-center">
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
            })}
          </div>
        </div>
        <div className="flex justify-end items-center bg-gray-100 px-8 py-4 rounded-b-2xl">
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded font-semibold text-base shadow-none border-none focus:outline-none cursor-pointer"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 