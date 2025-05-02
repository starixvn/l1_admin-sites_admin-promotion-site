"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import PromotionForm from "./PromotionForm";

interface Props {
  open: boolean;
  onClose: (shouldRefresh: boolean) => void;
}
export default function PromotionDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="w-full !max-w-3xl bg-gradient-to-b from-white via-blue-50 to-blue-100 rounded-2xl p-0 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Add New Promotion
          </DialogTitle>
          <button
            onClick={() => onClose(false)}
            className="mt-3 text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <PromotionForm onClose={() => onClose(true)} />
      </DialogContent>
    </Dialog>
  );
}
