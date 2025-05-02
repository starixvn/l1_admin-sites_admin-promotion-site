"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
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
      <DialogContent className="w-full !max-w-3xl bg-gradient-to-b from-white via-blue-50 to-blue-100 rounded-2xl p-8 space-y-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-gray-800">
            Add New Promotion
          </DialogTitle>
        </DialogHeader>

        <PromotionForm onClose={() => onClose(true)} />
      </DialogContent>
    </Dialog>
  );
}
