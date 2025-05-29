"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PromotionForm from "./PromotionForm";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: (shouldRefresh: boolean) => void;
}
export default function PromotionDialog({ open, onClose }: Props) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdPromotionCode, setCreatedPromotionCode] = useState("");
  const router = useRouter();

  const handleSuccess = (promotionCode: string) => {
    onClose(false);
    setCreatedPromotionCode(promotionCode);
    setTimeout(() => setShowSuccessDialog(true), 300);
  };

  const handleAddAnnouncement = () => {
    setShowSuccessDialog(false);
    router.push(`/announcement`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose(false)}>
        <DialogContent aria-describedby={undefined} className="dialog-content">
          <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Add New Promotion
            </DialogTitle>
            <button
              onClick={() => onClose(false)}
              className="mt-3 text-gray-500 hover:text-gray-700 transition"
              aria-label="Close"
            ></button>
          </div>
          <PromotionForm mode="create" onClose={() => onClose(true)} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={showSuccessDialog}
        title="Promotion Event Created Successfully!"
        message={`<b style="bold">Note:</b> The promotion <span style="color: #fbbf24; font-weight: 600;">${createdPromotionCode}</span> will use the <span style="color: #2563eb; font-weight: 600;">Default Announcement Template</span> if no specific announcement is selected.`}
        confirmText="Add Announcement"
        cancelText="OK"
        onConfirm={handleAddAnnouncement}
        onCancel={() => setShowSuccessDialog(false)}
      />
    </>
  );
}
