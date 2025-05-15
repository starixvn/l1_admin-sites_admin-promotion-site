import { useFormContext } from "react-hook-form";
import DateTimePicker from "@/components/custom/date-time-picker";

const BANNERS = [
  { id: 1, url: "https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg", label: "Template 1" },
  { id: 2, url: "https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg", label: "Template 2" },
  { id: 3, url: "https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg", label: "Template 3" },
];

const OPERATORS = [
  { value: "ONEwork_VG", label: "ONEwork_VG" },
  { value: "1W_Cash", label: "1W_Cash" },
  { value: "2W_Test", label: "2W_Test" },
];
const PROMO_CODES = [
  { value: "Summer_FSB", label: "Summer_FSB" },
  { value: "FSB_for_all_slots", label: "FSB_for_all_slots" },
  { value: "Promo_Test", label: "Promo_Test" },
];

export default function AnnouncementStep2({ onBack, onPreview, onSave }: { onBack: () => void; onPreview: () => void; onSave: () => void }) {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const banner = watch("banner");
  const dateFrom = watch("dateFrom");
  const dateTo = watch("dateTo");
  const mapping = watch("mapping");

  const isDuplicateOperator = (op: string, idx: number) => mapping.some((m: any, i: number) => m.operator === op && i !== idx);
  const isDateRangeDiff = (from: string, to: string) => {
    if (!mapping.length) return false;
    const first = mapping[0].time;
    return from !== first.from || to !== first.to;
  };
  const handleAdd = () => {
    setValue("mapping", [...mapping, { operator: "", code: "", time: { from: mapping[0]?.time.from || "", to: mapping[0]?.time.to || "" } }]);
  };
  const handleRemove = (idx: number) => {
    setValue("mapping", mapping.filter((_: any, i: number) => i !== idx));
  };
  const handleChange = (idx: number, field: string, value: string) => {
    setValue("mapping", mapping.map((m: any, i: number) => i === idx ? { ...m, [field]: value } : m));
  };

  return (
    <div className="flex flex-col space-y-4 pb-0">
      {/* Banner Template */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-1.5 mb-3">
        <div className="font-semibold text-gray-800 mb-1 text-sm">Banner Template <span className="text-red-500">*</span></div>
        <div className="flex justify-center gap-4">
          {BANNERS.map(b => (
            <div key={b.id} className={`cursor-pointer border-2 rounded-lg p-1 ${banner === b.id ? 'border-emerald-500' : 'border-transparent'}`} onClick={() => setValue("banner", b.id)}>
              <img src={b.url} alt={b.label} className="w-32 h-20 rounded object-cover" />
              <div className="text-center mt-1 text-sm font-medium">{b.label}</div>
            </div>
          ))}
        </div>
        {errors.banner && <div className="text-red-500 text-xs mt-1">{errors.banner.message as string}</div>}
      </div>
      {/* Display Date */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-1.5 mb-3">
        <div className="font-semibold text-gray-800 mb-1 text-sm">Display Date (GMT+7) <span className="text-red-500">*</span></div>
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <DateTimePicker
              value={dateFrom}
              onChange={val => setValue("dateFrom", val)}
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="flex-1">
            <DateTimePicker
              value={dateTo}
              onChange={val => setValue("dateTo", val)}
            />
          </div>
        </div>
        {errors.dateFrom && <div className="text-red-500 text-xs mt-1">{errors.dateFrom.message as string}</div>}
        {errors.dateTo && <div className="text-red-500 text-xs mt-1">{errors.dateTo.message as string}</div>}
      </div>
      {/* Promotion Mapping */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-1.5 mb-3">
        <div className="font-semibold text-gray-800 mb-1 text-sm">Promotion Mapping <span className="text-red-500">*</span></div>
        <div className="flex flex-col gap-1.5 w-full">
          {mapping.map((m: any, idx: number) => {
            const dateDiff = isDateRangeDiff(m.time.from, m.time.to) && idx > 0;
            return (
              <div key={idx} className="flex items-center gap-2 w-full flex-wrap">
                <select
                  value={m.operator}
                  onChange={e => handleChange(idx, "operator", e.target.value)}
                  className="border px-2 py-1 rounded min-w-[120px] text-sm"
                  disabled={isDuplicateOperator(m.operator, idx) && m.operator !== ""}
                >
                  <option value="">Select Operator</option>
                  {OPERATORS.filter((op: any) => !mapping.some((mm: any, i: number) => mm.operator === op.value && i !== idx)).map((op: any) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                <select
                  value={m.code}
                  onChange={e => handleChange(idx, "code", e.target.value)}
                  className="border px-2 py-1 rounded min-w-[120px] text-sm"
                >
                  <option value="">Promotion Code</option>
                  {PROMO_CODES.map(pc => (
                    <option key={pc.value} value={pc.value}>{pc.label}</option>
                  ))}
                </select>
                <button onClick={() => handleRemove(idx)} className="text-red-500 font-bold text-lg px-1" type="button">×</button>
                <span className={`ml-2 text-xs font-semibold ${dateDiff ? 'text-red-600' : 'text-gray-700'}`}>
                  (From {m.time.from} to {m.time.to})
                </span>
              </div>
            );
          })}
        </div>
        {errors.mapping && <div className="text-red-500 text-xs mt-1">{errors.mapping.message as string}</div>}
        <button type="button" onClick={handleAdd} className="flex items-center gap-1 mt-2 text-emerald-600 font-bold text-sm hover:underline">
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