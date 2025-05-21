import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announcementSchema, AnnouncementFormValues } from "./announcementSchema";
import AnnouncementStep1 from "./AnnouncementStep1";
import AnnouncementStep2 from "./AnnouncementStep2";
import { addDays } from "date-fns";
import { toast } from "react-toastify";
import { Announcement } from "@/types/announcement";

export default function AnnouncementForm({ onClose, onCreated, initialValues, mode = 'create' }: {
  onClose: () => void,
  onCreated?: () => void,
  initialValues?: Announcement,
  mode?: 'create' | 'edit'
}) {
  const [step, setStep] = useState(1);
  const methods = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    mode: "onSubmit",
    defaultValues: initialValues
      ? {
          ...initialValues,
          fromDate: new Date(initialValues.fromDate),
          toDate: new Date(initialValues.toDate)
        }
      : {
        promotionTitle: { "en-US": "" },
        bannerContent: { "en-US": "" },
        termsAndConditions: { "en-US": "" },
        template: 1,
        fromDate: addDays(new Date(), 7),
        toDate: addDays(new Date(), 7),
        promotionMappings: [],
      },
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    const valid = await trigger(["promotionTitle", "bannerContent", "termsAndConditions"]);
    if (valid) {
      setStep(2);
    }
  };
  const handleBack = () => setStep(1);
  const handleSave = handleSubmit(async (data) => {
    try {
      const body = { ...data };
      if (mode === 'edit' && initialValues?._id) {
        await fetch(`/api/announcement/${initialValues._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        toast.success("Announcement updated successfully");
      } else {
        await fetch('/api/announcement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        toast.success("Announcement created successfully");
      }
      onCreated?.();
      onClose();
    } catch {
      alert('Failed to save announcement');
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="w-full">
        {/* Step Progress */}
        <div className="flex items-center justify-between px-8">
          <div className="text-sm font-medium text-gray-600">Step {step} of 2</div>
          <div className="text-sm font-medium text-gray-600">{step === 1 ? "Announcement Contents" : "Announcement Settings"}</div>
        </div>
        <div className="px-8 pt-2 pb-6">
          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className={`h-full bg-gray-800 transition-all duration-300`} style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>
        </div>
        {step === 1 && <AnnouncementStep1 onNext={handleNext} />}
        {step === 2 && <AnnouncementStep2 onBack={handleBack} onSave={handleSave} mode={mode} />}
      </div>
    </FormProvider>
  );
} 