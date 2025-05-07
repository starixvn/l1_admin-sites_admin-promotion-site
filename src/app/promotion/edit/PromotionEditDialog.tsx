import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PromotionForm from "../create/PromotionForm";
import { Promotion } from "@/types/promotion";

interface PromotionEditDialogProps {
  open: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onSave: (promotion: Promotion) => Promise<void>;
}

export default function PromotionEditDialog({
  open,
  promotion,
  onClose,
  onSave,
}: PromotionEditDialogProps) {
  if (!open || !promotion) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dialog-content">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Edit Promotion
          </DialogTitle>
          <button
            onClick={onClose}
            className="mt-3 text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          ></button>
        </div>
        <PromotionForm 
          mode="edit"
          initialValues={promotion}
          onClose={onClose}
          onSubmit={onSave}
        />
      </DialogContent>
    </Dialog>
  );
} 