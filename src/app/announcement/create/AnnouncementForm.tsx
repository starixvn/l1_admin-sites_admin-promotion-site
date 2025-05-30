import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAnnouncementSchema,
  AnnouncementFormValues,
} from "./announcementSchema";
import AnnouncementStep1 from "./AnnouncementStep1";
import AnnouncementStep2 from "./AnnouncementStep2";
import { toast } from "react-toastify";
import { Announcement } from "@/types/announcement";
import { PROMOTION_STATUS_MAP } from "@/constants/promotionStatusMap";

function getTomorrowAtMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

function getAnnouncementStatus(fromDate: string, toDate: string): string {
  const now = new Date();
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (now < from) {
    return PROMOTION_STATUS_MAP.Upcoming;
  }
  if (now > to) {
    return PROMOTION_STATUS_MAP.Completed;
  }
  return PROMOTION_STATUS_MAP.Running;
}

export default function AnnouncementForm({
  onClose,
  onCreated,
  initialValues,
  mode = "create",
}: {
  onClose: () => void;
  onCreated?: () => void;
  initialValues?: Announcement;
  mode?: "create" | "edit";
}) {
  const [step, setStep] = useState(1);
  let status = PROMOTION_STATUS_MAP.Upcoming;
  if (initialValues) {
    status = getAnnouncementStatus(initialValues.fromDate, initialValues.toDate);
  }
  const isEditable = mode === 'edit' && status !== "not_started";
  const methods = useForm<AnnouncementFormValues>({
    resolver: zodResolver(getAnnouncementSchema(!isEditable)),
    mode: "onSubmit",
    defaultValues: initialValues
      ? {
          ...initialValues,
          fromDate: new Date(initialValues.fromDate),
          toDate: new Date(initialValues.toDate),
          promotionMappings: initialValues.mappings,
        }
      : {
          promotionTitle: { "en-US": "" },
          bannerContent: { "en-US": "" },
          termsAndConditions: { "en-US": "" },
          template: 1,
          fromDate: getTomorrowAtMidnight(),
          toDate: getTomorrowAtMidnight(),
          promotionMappings: [],
        },
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    const valid = await trigger([
      "promotionTitle",
      "bannerContent",
      "termsAndConditions",
    ]);
    if (valid) {
      setStep(2);
    }
  };
  const handleBack = () => setStep(1);
  const handleSave = handleSubmit(async (data) => {
    try {
      const { uploadedFileName, promotionMappings, ...rest } = data;

      const body = {
        ...rest,
        promotionMappings: promotionMappings.map((item) => item.promotionCode),
      };
      if (mode === "edit" && initialValues?._id) {
        await fetch(`/api/announcement/${initialValues._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Announcement updated successfully");
      } else {
        await fetch("/api/announcement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Announcement created successfully");
      }
      onCreated?.();
      onClose();
    } catch {
      alert("Failed to save announcement");
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="w-full">
        {/* Step Progress */}
        <div className="flex items-center justify-between px-8">
          <div className="text-sm font-medium text-gray-600">
            Step {step} of 2
          </div>
          <div className="text-sm font-medium text-gray-600">
            {step === 1 ? "Announcement Contents" : "Announcement Settings"}
          </div>
        </div>
        <div className="px-8 pt-2 pb-6">
          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full bg-gray-800 transition-all duration-300`}
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>
        {step === 1 && <AnnouncementStep1 onNext={handleNext} />}
        {step === 2 && (
          <AnnouncementStep2
            onBack={handleBack}
            onSave={handleSave}
            mode={mode}
            status={status}
          />
        )}
      </div>
    </FormProvider>
  );
}
