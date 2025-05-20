import { useFormContext } from "react-hook-form";
import DateTimePicker from "@/components/custom/date-time-picker";
import { useEffect, useState } from "react";
import { Promotion } from "@/types/promotion";
import { Operator } from "@/types/operator";
import { usePromotions } from '@/hooks/usePromotions';
import ConfirmDialog from '@/components/ConfirmDialog';
import { PromotionMapping } from "@/types/announcement";
import configs from "../../../../configs";
import { ImageIcon } from "lucide-react";

const countTemplate = 3;

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

function isDateRangeDiff(from: string, to: string, promotionMappings: PromotionMapping[], promotions: Promotion[]): boolean {
  if (!promotionMappings.length || from === "" || to === "") {
    return false;
  }
  const firstPromotionCode = promotionMappings[0].promotionCode;
  const firstPromotion = promotions.find(p => p.code === firstPromotionCode);
  if (!firstPromotion) {
    return false;
  }
  return from !== firstPromotion.startDate || to !== firstPromotion.endDate;
}

// Add these helper functions before the main component
const getRowErrors = (errors: any, idx: number) => {
  const rowError = Array.isArray(errors.promotionMappings) && (errors.promotionMappings as { operatorId?: { message?: string }; promotionCode?: { message?: string } }[])[idx];
  if (!rowError || typeof rowError !== 'object') {
    return { operatorError: undefined, promotionError: undefined };
  }
  return {
    operatorError: rowError.operatorId?.message,
    promotionError: rowError.promotionCode?.message
  };
};

const getDateInfo = (promotion: Promotion | undefined, idx: number, promotionMappings: PromotionMapping[], promotions: Promotion[]) => {
  const from = promotion?.startDate || "";
  const to = promotion?.endDate || "";
  const dateDiff = isDateRangeDiff(from, to, promotionMappings, promotions) && idx > 0;
  return { from, to, dateDiff };
};

// Add this new component
const MappingRow = ({ 
  mapping, 
  idx, 
  errors, 
  isEditable, 
  promotions, 
  promotionMappings,
  onOperatorChange,
  onPromotionChange,
  onRemove,
  getFilteredOperators,
  getFilteredPromotions,
  isDuplicateOperator,
  formatDateTime 
}: {
  mapping: PromotionMapping;
  idx: number;
  errors: any;
  isEditable: boolean;
  promotions: Promotion[];
  promotionMappings: PromotionMapping[];
  onOperatorChange: (idx: number, value: string) => void;
  onPromotionChange: (idx: number, value: string) => void;
  onRemove: (idx: number) => void;
  getFilteredOperators: (code: string) => Operator[];
  getFilteredPromotions: (operatorId: string) => Promotion[];
  isDuplicateOperator: (operatorId: string, idx: number) => boolean;
  formatDateTime: (date: string) => string;
}) => {
  const selectedPromotion = promotions.find(p => p.code === mapping.promotionCode);
  const { from, to, dateDiff } = getDateInfo(selectedPromotion, idx, promotionMappings, promotions);
  const { operatorError, promotionError } = getRowErrors(errors, idx);

  const renderErrorMessages = () => {
    if (!operatorError && !promotionError) {
      return null;
    }
    return (
      <div className="flex gap-8 mb-1">
        <div className="min-w-[120px] text-red-500 text-xs">{operatorError || ""}</div>
        <div className="min-w-[120px] text-red-500 text-xs">{promotionError || ""}</div>
      </div>
    );
  };

  const renderDateRange = () => {
    if (!mapping.promotionCode) {
      return null;
    }
    return (
      <span className={`ml-2 text-xs font-semibold ${dateDiff ? 'text-red-600' : 'text-gray-900'}`}>
        (<b>From {formatDateTime(from)} to {formatDateTime(to)}</b>)
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {renderErrorMessages()}
      <div className="flex items-center gap-2 w-full flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex flex-col min-w-[120px]">
            <select
              value={mapping.operatorId || ""}
              onChange={e => onOperatorChange(idx, e.target.value)}
              className={`border border-gray-300 rounded-xl px-2 py-1 text-sm min-w-[100px] h-9 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 hover:border-blue-400 transition-all bg-white ${!isEditable ? 'pointer-events-none opacity-60 bg-gray-100' : ''}`}
              disabled={!isEditable || (isDuplicateOperator(mapping.operatorId, idx) && mapping.operatorId !== "")}
            >
              <option value="">Select Operator</option>
              {getFilteredOperators(mapping.promotionCode)
                .filter(op => !promotionMappings.some((mm, i) => mm.operatorId === op.PartnerId && i !== idx))
                .map(op => (
                  <option key={op.PartnerId} value={op.PartnerId}>{op.Name}</option>
                ))}
            </select>
          </div>
          <div className="flex flex-col min-w-[120px]">
            <select
              value={mapping.promotionCode || ""}
              onChange={e => onPromotionChange(idx, e.target.value)}
              className={`border border-gray-300 rounded-xl px-2 py-1 text-sm min-w-[200px] w-[260px] h-9 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 hover:border-blue-400 transition-all bg-white ${!isEditable ? 'pointer-events-none opacity-60 bg-gray-100' : ''}`}
              disabled={!isEditable}
            >
              <option value="">Promotion Code</option>
              {getFilteredPromotions(mapping.operatorId).map(p => (
                <option key={p.code} value={p.code}>{p.code}</option>
              ))}
            </select>
          </div>
          {isEditable && <button onClick={() => onRemove(idx)} className="text-red-500 font-bold text-lg px-1" type="button" disabled={!isEditable}>×</button>}
          {renderDateRange()}
        </div>
      </div>
    </div>
  );
};

// Add this component for template image
const TemplateImage = ({ template }: { template: number }) => {
  if (!configs.apiConfigurationUrl) {
    return (
      <div className="w-32 h-20 rounded bg-gray-100 flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img 
      src={`${configs.apiConfigurationUrl}/template-${template}/banner-1.png`} 
      alt={`Template ${template}`} 
      className="w-32 h-20 rounded object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.parentElement?.classList.add('bg-gray-100');
        const icon = document.createElement('div');
        icon.className = 'w-32 h-20 rounded bg-gray-100 flex items-center justify-center';
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
        target.parentElement?.appendChild(icon);
      }}
    />
  );
};

export default function AnnouncementStep2({ onBack, onSave, status, mode }: { onBack: () => void; onSave: () => void; status?: string; mode?: 'create' | 'edit' }) {
  const { setValue, watch, formState: { errors }, trigger } = useFormContext();
  const template = watch("template");
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");
  const promotionMappings: PromotionMapping[] = watch("promotionMappings");

  const [operators, setOperators] = useState<Operator[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [allOperators, setAllOperators] = useState<Operator[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const isEditable = mode === 'create' || (mode === 'edit' && status !== 'Upcoming');

  // Fetch all operators once
  useEffect(() => {
    fetch("/api/operators")
      .then(res => res.json())
      .then(data => {
        setAllOperators(data);
        setOperators(data);
      })
      .catch(error => {
        console.error("Error fetching operators:", error);
      });
  }, []); // Empty dependency array

  // Replace the useEffect with usePromotions hook
  const { promotions: allPromotions } = usePromotions({ 
    mode: mode || 'create', // Use the mode from props, default to 'create'
    // Only filter by operatorId in create mode
    operatorId: mode === 'create' && allOperators.length > 0 ? allOperators[0].PartnerId : undefined 
  });

  useEffect(() => {
    if (allPromotions.length > 0) {
      // For edit mode, show all promotions
      // For create mode, filter promotions with operators
      const validPromotions = mode === 'create' 
        ? allPromotions.filter((p: Promotion) => 
            operators.some(op => op.PartnerId === p.operatorId)
          )
        : allPromotions;
      setPromotions(validPromotions);
    }
  }, [allPromotions, operators, mode]);

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
    if (!promotion) {
      return [];
    }
    return operators.filter(op => op.PartnerId === promotion.operatorId);
  };

  const isDuplicateOperator = (op: string, idx: number) => 
    promotionMappings.some((m, i) => m.operatorId === op && i !== idx);
  const handleAdd = () => {
    setValue("promotionMappings", [...promotionMappings, { 
      operatorId: "", 
      promotionCode: "", 
    }]);
  };
  const handleRemove = (idx: number) => {
    setValue("promotionMappings", promotionMappings.filter((_, i) => i !== idx));
  };
  const handleChange = async (idx: number, field: string, value: string) => {
    const updatedMappings = promotionMappings.map((m, i) => {
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
  const handleSaveClick = async () => {
    const isValid = await trigger(["template", "fromDate", "toDate", "promotionMappings"]);
    if (isValid) {
      setShowConfirm(true);
    }
  };
  const handleConfirmSave = () => {
    setShowConfirm(false);
    onSave();
  };

  return (
    <div className="flex flex-col space-y-4 pb-0">
      {/* Banner Template */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-1.5 mb-3">
        <div className="font-semibold text-gray-800 mb-1 text-sm">Banner Template <span className="text-red-500">*</span></div>
        <div className="flex justify-center gap-4">
          {Array.from({ length: countTemplate }, (_, i) => (
            <div key={i + 1} className={`cursor-pointer border-2 rounded-lg p-1 ${template === i + 1 ? 'border-emerald-500' : 'border-transparent'}`} onClick={() => setValue("template", i + 1)}>
              <TemplateImage template={i + 1} />
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
          {promotionMappings.map((m, idx) => (
            <MappingRow
              key={idx}
              mapping={m}
              idx={idx}
              errors={errors}
              isEditable={isEditable}
              promotions={promotions}
              promotionMappings={promotionMappings}
              onOperatorChange={(idx, value) => handleChange(idx, "operator", value)}
              onPromotionChange={(idx, value) => handleChange(idx, "code", value)}
              onRemove={handleRemove}
              getFilteredOperators={getFilteredOperators}
              getFilteredPromotions={getFilteredPromotions}
              isDuplicateOperator={isDuplicateOperator}
              formatDateTime={formatDateTime}
            />
          ))}
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
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow transition text-sm" onClick={handleSaveClick} type="button">Save</button>
        </div>
      </div>
      <ConfirmDialog
        open={showConfirm}
        title={<span style={{ color: 'red', fontWeight: 700 }}>Confirm Save</span>}
        message={`<div>Are you sure you want to save this announcement?</div>
          <div><strong>Reminder:</strong> Please double-check all information before saving.</div>`}
        confirmText="Yes"
        cancelText="No"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
} 