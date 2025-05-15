import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PromotionViewForm from "./PromotionViewForm";
import type { PromotionFormValues } from "./PromotionForm";
import type { Game } from "@/types/game";
import { Button } from "@/components/ui/button";
import { CurrencyGroup } from "@/types/currency-group";

interface PromotionPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  data: PromotionFormValues;
  operatorName?: string;
  gameList?: Game[];
  currencyGroupsInfo?: CurrencyGroup[];
  onConfirm: (payload: PromotionFormValues) => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  initialId?: string;
  readonly?: boolean;
}

export default function PromotionPreviewDialog({
  open,
  onClose,
  data,
  operatorName,
  gameList,
  currencyGroupsInfo,
  onConfirm,
  isSubmitting,
  readonly,
}: PromotionPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[70vw] !max-w-[800px] max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl p-0 flex flex-col"
        aria-describedby="promotion-preview-desc"
      >
        <div className="sticky px-6 py-4 border-b bg-white rounded-t-2xl">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            {readonly
              ? "🎯 Promotion Details"
              : "📝 Review & Confirm Promotion"}
          </DialogTitle>
          <span id="promotion-preview-desc" className="sr-only">
            {readonly
              ? "View promotion details"
              : "Review promotion details and confirm or go back to edit"}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <PromotionViewForm
            data={data}
            operatorName={operatorName}
            gameList={gameList}
            currencyGroupsInfo={currencyGroupsInfo}
            readonly={readonly}
          />
        </div>
        <div className="sticky bottom-0 z-10 px-6 py-4 border-t bg-white rounded-b-2xl">
          {readonly ? (
            <div className="flex justify-end">
              <Button onClick={onClose} className="btn-cancel min-w-[100px]">
                Close
              </Button>
            </div>
          ) : (
            <div className="flex justify-between">
              <Button onClick={onClose} className="btn-cancel">
                ← Back
              </Button>
              <Button
                className="btn-primary flex items-center gap-2"
                onClick={() => onConfirm(data)}
                disabled={isSubmitting}
              >
                Confirm
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
