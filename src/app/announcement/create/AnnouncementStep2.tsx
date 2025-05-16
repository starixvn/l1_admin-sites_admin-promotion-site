import { useFormContext } from "react-hook-form";
import DateTimePicker from "@/components/custom/date-time-picker";
import { useEffect, useState } from "react";
import { Promotion } from "@/types/promotion";
import { Operator } from "@/types/operator";

const countTemplate = 3;

function formatDateTime(dateStr: string) {
  if (!dateStr) return "";
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

export default function AnnouncementStep2({ onBack, onPreview, onSave, status, mode }: { onBack: () => void; onPreview: () => void; onSave: () => void; status?: string; mode?: 'create' | 'edit' }) {
  const { setValue, watch, formState: { errors }, trigger } = useFormContext();
  const template = watch("template");
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");
  const promotionMappings = watch("promotionMappings");

  const [operators, setOperators] = useState<Operator[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [allOperators, setAllOperators] = useState<Operator[]>([]);
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);

  const isEditable = mode === 'create' || (mode === 'edit' && status !== 'Upcoming');

  // Fetch all operators once
  useEffect(() => {
    fetch("/api/operators")
      .then(res => res.json())
      .then(data => {
        setAllOperators(data);
        // Initial filter of operators with promotions
        const operatorsWithPromotions = data.filter((op: Operator) => 
          allPromotions.some(p => p.operatorId === op.PartnerId)
        );
        setOperators(operatorsWithPromotions);
      })
      .catch(error => {
        console.error("Error fetching operators:", error);
      });
  }, []); // Empty dependency array

  // Fetch all promotions once
  useEffect(() => {
    fetch("/api/promotions?status=not_started&pageIndex=1&pageSize=100")
      .then(res => res.json())
      .then(data => {
        const items = data.items || data.data || [];
        setAllPromotions(items);
        // Initial filter of promotions with operators
        const validPromotions = items.filter((p: Promotion) => 
          allOperators.some(op => op.PartnerId === p.operatorId)
        );
        setPromotions(validPromotions);
      });
  }, []); // Empty dependency array

  // Update filtered lists when either allOperators or allPromotions change
  useEffect(() => {
    if (allOperators.length > 0 && allPromotions.length > 0) {
      // Update operators list
      const operatorsWithPromotions = allOperators.filter((op: Operator) => 
        allPromotions.some(p => p.operatorId === op.PartnerId)
      );
      setOperators(operatorsWithPromotions);

      // Update promotions list
      const validPromotions = allPromotions.filter((p: Promotion) => 
        allOperators.some(op => op.PartnerId === p.operatorId)
      );
      setPromotions(validPromotions);
    }
  }, [allOperators, allPromotions]);

  const getFilteredPromotions = (operatorId: string) => {
    if (!operatorId) {
      return promotions;
    }
    return promotions.filter(p => p.operatorId === operatorId);
  };

  const getFilteredOperators = (code: string) => {
    if (!code) {
      return operators;
    }
    const promotion = promotions.find(p => p.code === code);
    if (!promotion) return [];
    return operators.filter(op => op.PartnerId === promotion.operatorId);
  };

  const isDuplicateOperator = (op: string, idx: number) => 
    promotionMappings.some((m: any, i: number) => m.operatorId === op && i !== idx);
  const isDateRangeDiff = (from: string, to: string) => {
    if (!promotionMappings.length || from === "" || to === "") return false;
    const firstPromotionCode = promotionMappings[0].promotionCode;
    const firstPromotion = promotions.find(p => p.code === firstPromotionCode);
    if (!firstPromotion) return false;
    return from !== firstPromotion.startDate || to !== firstPromotion.endDate;
  };
  const handleAdd = () => {
    setValue("promotionMappings", [...promotionMappings, { 
      operatorId: "", 
      promotionCode: "", 
    }]);
  };
  const handleRemove = (idx: number) => {
    setValue("promotionMappings", promotionMappings.filter((_: any, i: number) => i !== idx));
  };
  const handleChange = async (idx: number, field: string, value: string) => {
    const updatedMappings = promotionMappings.map((m: any, i: number) => {
      if (i === idx) {
        if (field === "operator") {
          return {
            ...m,
            operatorId: value,
            time: m.time
          };
        } else if (field === "code") {
          return {
            ...m,
            promotionCode: value,
            time: m.time
          };
        }
        return { ...m, [field]: value };
      }
      return m;
    });
    setValue("promotionMappings", updatedMappings);
    await trigger("promotionMappings");
  };

  return (
    <div className="flex flex-col space-y-4 pb-0">
      {/* Banner Template */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-1.5 mb-3">
        <div className="font-semibold text-gray-800 mb-1 text-sm">Banner Template <span className="text-red-500">*</span></div>
        <div className="flex justify-center gap-4">
          {Array.from({ length: countTemplate }, (_, i) => (
            <div key={i + 1} className={`cursor-pointer border-2 rounded-lg p-1 ${template === i + 1 ? 'border-emerald-500' : 'border-transparent'}`} onClick={() => setValue("template", i + 1)}>
              <img src={`${process.env.NEXT_PUBLIC_API_CONFIGURATION_URL}/template-${i + 1}/banner-1.png`} alt={`Template ${i + 1}`} className="w-32 h-20 rounded object-cover" />
              <div className="text-center mt-1 text-sm font-medium">{`Template ${i + 1}`}</div>
            </div>
          ))}
        </div>
        {errors.template && <div className="text-red-500 text-xs mt-1">{errors.template.message as string}</div>}
      </div>
      {/* Display Date */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-1.5 mb-3">
        <div className="font-semibold text-gray-800 mb-1 text-sm">Display Date (GMT+7) <span className="text-red-500">*</span></div>
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <DateTimePicker
              value={fromDate}
              disabled={!isEditable} 
              onChange={val => setValue("fromDate", val)}
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="flex-1">
            <DateTimePicker
              value={toDate}
              disabled={!isEditable}
              onChange={val => setValue("toDate", val)}
            />
          </div>
        </div>
        {errors.fromDate && <div className="text-red-500 text-xs mt-1">{errors.fromDate.message as string}</div>}
        {errors.toDate && <div className="text-red-500 text-xs mt-1">{errors.toDate.message as string}</div>}
      </div>
      {/* Promotion Mapping */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-1.5 mb-3">
        <div className="font-semibold text-gray-800 mb-1 text-sm">Promotion Mapping <span className="text-red-500">*</span></div>
        <div className="flex flex-col gap-1.5 w-full">
          {promotionMappings.map((m: any, idx: number) => {
            const selectedPromotion = promotions.find(p => p.code === m.promotionCode);
            const from = selectedPromotion?.startDate || "";
            const to = selectedPromotion?.endDate || "";
            const dateDiff = isDateRangeDiff(from, to) && idx > 0;

            const rowError = Array.isArray(errors.promotionMappings) && (errors.promotionMappings as any[])[idx];
            const operatorError = rowError?.operatorId?.message;
            const promotionError = rowError?.promotionCode?.message;

            return (
              <div key={idx} className="flex flex-col w-full">
                {(operatorError || promotionError) && (
                  <div className="flex gap-8 mb-1">
                    <div className="min-w-[120px] text-red-500 text-xs">{operatorError || ""}</div>
                    <div className="min-w-[120px] text-red-500 text-xs">{promotionError || ""}</div>
                  </div>
                )}
                <div className="flex items-center gap-2 w-full flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex flex-col min-w-[120px]">
                      <select
                        value={m.operatorId || ""}
                        onChange={e => handleChange(idx, "operator", e.target.value)}
                        className={`border border-gray-300 rounded-xl px-2 py-1 text-sm min-w-[100px] h-9 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 hover:border-blue-400 transition-all bg-white ${!isEditable ? 'pointer-events-none opacity-60 bg-gray-100' : ''}`}
                        disabled={!isEditable || (isDuplicateOperator(m.operatorId, idx) && m.operatorId !== "")}
                      >
                        <option value="">Select Operator</option>
                        {getFilteredOperators(m.promotionCode)
                          .filter(op => !promotionMappings.some((mm: any, i: number) => mm.operatorId === op.PartnerId && i !== idx))
                          .map(op => (
                            <option key={op.PartnerId} value={op.PartnerId}>{op.Name}</option>
                          ))}
                      </select>
                    </div>
                    <div className="flex flex-col min-w-[120px]">
                      <select
                        value={m.promotionCode || ""}
                        onChange={e => handleChange(idx, "code", e.target.value)}
                        className={`border border-gray-300 rounded-xl px-2 py-1 text-sm min-w-[100px] h-9 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 hover:border-blue-400 transition-all bg-white ${!isEditable ? 'pointer-events-none opacity-60 bg-gray-100' : ''}`}
                        disabled={!isEditable}
                      >
                        <option value="">Promotion Code</option>
                        {getFilteredPromotions(m.operatorId).map(p => (
                          <option key={p.code} value={p.code}>{p.code}</option>
                        ))}
                      </select>
                    </div>
                    {isEditable && <button onClick={() => handleRemove(idx)} className="text-red-500 font-bold text-lg px-1" type="button" disabled={!isEditable}>×</button>}
                    {m.promotionCode && (
                      <span className={`ml-2 text-xs font-semibold ${dateDiff ? 'text-red-600' : 'text-gray-900'}`}>
                        (<b>From {formatDateTime(from)} to {formatDateTime(to)}</b>)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.promotionMappings && <div className="text-red-500 text-xs mt-1">{errors.promotionMappings.message as string}</div>}
        <button 
          type="button" 
          onClick={handleAdd} 
          disabled={!isEditable}
          className={`flex items-center gap-1 mt-2 text-sm font-bold ${
            !isEditable  
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-emerald-600 hover:underline'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
            Add new Operator
        </button>
      </div>
      {/* Actions */}
      <div className="w-full max-w-3xl mx-auto flex justify-between gap-2 pt-2 mt-auto pb-4">
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow transition text-sm" onClick={onBack} type="button">← Back</button>
        <div className="flex gap-1.5">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow transition text-sm" onClick={onPreview} type="button">Preview</button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow transition text-sm" onClick={onSave} type="button">Save</button>
        </div>
      </div>
    </div>
  );
} 