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
      <DialogContent className="w-[70vw] !max-w-[800px] max-h-[90vh] overflow-y-auto p-6 bg-white rounded-lg">
        <DialogTitle className="text-xl font-semibold pb-3">
          Promotion Details
        </DialogTitle>

        <PromotionViewForm
          data={data}
          operatorName={operatorName}
          gameList={gameList}
          currencyGroupsInfo={currencyGroupsInfo}
          readonly={readonly}
        />
        {readonly ? (
          <div className="mt-4 flex justify-end">
            <Button onClick={onClose} className="btn-cancel min-w-[100px]">
              Close
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex justify-between">
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
      </DialogContent>
    </Dialog>
  );
}
