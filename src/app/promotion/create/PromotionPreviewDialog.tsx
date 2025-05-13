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
      <DialogContent className="w-[40vw] h-[90vh] max-w-[1200px] md:max-w-[98vw] overflow-y-auto p-6 bg-white rounded-lg">
        <DialogTitle className="text-xl font-semibold">
          Promotion Details
        </DialogTitle>

        <PromotionViewForm
          data={data}
          operatorName={operatorName}
          gameList={gameList}
          currencyGroupsInfo={currencyGroupsInfo}
          readonly={readonly}
        />
        {!readonly && (
          <div className="mt-6 flex justify-between">
            <Button onClick={onClose} className="btn-cancel">
              ← Back
            </Button>
            <Button
              className="btn-primary flex items-center gap-2"
              onClick={() => onConfirm(data)}
              disabled={isSubmitting}
            >
              Confirm & Save
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
