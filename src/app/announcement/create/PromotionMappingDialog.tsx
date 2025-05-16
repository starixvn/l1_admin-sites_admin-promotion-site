import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Mapping {
  operatorId: string;
  promotionCode: string;
}
interface Operator { PartnerId: string; Name: string; }
interface Promotion { code: string; name: string; startDate: string; endDate: string; }

function formatDateTime(dateStr: string) {
  if (!dateStr) return "";
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
      <DialogContent className="min-w-[700px] max-w-2xl w-full p-0 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="px-8 pt-8 pb-4 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Promotion Mapping</h2>
        </div>
        <div className="px-8 py-8 bg-gray-50">
          <div className="flex flex-col gap-6">
            {mappings.length === 0 && <div className="text-gray-400">No mapping</div>}
            {mappings.map((m, idx) => {
              const operator = operators.find(o => o.PartnerId === m.operatorId);
              const promotion = promotions.find(p => p.code === m.promotionCode);
              return (
                <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 mb-1 flex-wrap">
                  {/* Operator badge */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mr-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-1 inline-block"></span>
                    {operator ? operator.Name : m.operatorId}
                  </span>
                  {/* Promotion code badge */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200 mr-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 inline-block"></span>
                    {promotion ? promotion.code : m.promotionCode}
                  </span>
                  {/* Date range */}
                  {promotion && (
                    <span className="inline-flex items-center text-xs text-gray-700 ml-2 font-mono whitespace-nowrap">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      {formatDateTime(promotion.startDate)} - {formatDateTime(promotion.endDate)}
                    </span>
                  )}
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