"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PromotionForm from "./PromotionForm";

export default function PromotionDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full !max-w-5xl h-[90vh] overflow-y-auto bg-gray-100 rounded-2xl p-10 space-y-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-gray-800">
            Add New Promotion
          </DialogTitle>
        </DialogHeader>

        <PromotionForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
