"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PromotionForm from "./PromotionForm";

interface Props {
  open: boolean;
  onClose: (shouldRefresh: boolean) => void;
}
export default function PromotionDialog({ open, onClose }: Props) {
  return (
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
        <PromotionForm mode="create" onClose={() => onClose(true)} />
      </DialogContent>
    </Dialog>
  );
}
