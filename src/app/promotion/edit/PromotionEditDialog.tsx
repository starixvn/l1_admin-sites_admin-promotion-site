import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  if (!open || !promotion) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full !max-w-6xl bg-gradient-to-b from-white via-blue-50 to-blue-100 rounded-3xl p-12 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-800">
            Edit Promotion
          </DialogTitle>
        </DialogHeader>
        
        <PromotionForm 
          initialValues={promotion}
          onClose={onClose}
          onSubmit={onSave}
        />
      </DialogContent>
    </Dialog>
  );
} 