"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useCurrencyGroups } from "@/hooks/useCurrencyGroups";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GAME_TYPES } from "@/constants/gameTypes";
import { CurrencyGroup } from "@/types/currencyGroup";

type Props = {
  open: boolean;
  onClose: () => void;
  partnerId: string;
  gameType: number;
  onSave: (data: {
    currencyGroups: string[];
    betLevels: { currencyGroup: string; betLevel: number }[];
  }) => void;
};

type RowState = {
  id: string;
  name: string;
  enabled: boolean;
  betLevel: number;
};

export default function BetSettingsDialog({
  open,
  onClose,
  partnerId,
  gameType,
  onSave,
}: Props) {
  const { data: currencyGroups = [] } = useCurrencyGroups(partnerId);
  const [rows, setRows] = useState<RowState[]>([]);

  useEffect(() => {
    if (currencyGroups.length > 0) {
      setRows(
        currencyGroups.map((cg: CurrencyGroup) => ({
          id: cg.Id,
          name: cg.Name,
          enabled: false,
          betLevel: getSuggestedBetLevel(gameType),
        }))
      );
    }
  }, [currencyGroups, gameType]);

  const getSuggestedBetLevel = (type: number) => {
    return type === GAME_TYPES.CASCADING ? 1 : 0.1;
  };

  const getTotalBet = (betLevel: number) => {
    return gameType === GAME_TYPES.CASCADING
      ? 1 * betLevel * 20
      : betLevel * 25;
  };

  const handleToggle = (index: number, enabled: boolean) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index].enabled = enabled;
      if (enabled && !updated[index].betLevel) {
        updated[index].betLevel = getSuggestedBetLevel(gameType);
      }
      return updated;
    });
  };

  const handleChangeBet = (index: number, value: string) => {
    const num = parseFloat(value);
    setRows((prev) => {
      const updated = [...prev];
      updated[index].betLevel = isNaN(num) ? 0 : num;
      return updated;
    });
  };

  const handleSave = () => {
    const enabledRows = rows.filter((r) => r.enabled);
    onSave({
      currencyGroups: enabledRows.map((r) => r.id),
      betLevels: enabledRows.map((r) => ({
        currencyGroup: r.id,
        betLevel: r.betLevel,
      })),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Bet Setting pop-up for {gameType === 2 ? "Classic Slot" : "Cascading Slot"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>**</strong> Turn ON the Promotion for the currency group
            which you want to offer the Free Spin Bonus.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-2 text-left">Currency Group</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Bet Level</th>
                  <th className="px-2 py-2 flex items-center gap-1 justify-center">
                    Total Bet
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {gameType === 2
                            ? "Classic: Bet Level x 25 = Total Bet"
                            : "Cascading: Coin Value x Bet Level x Multiplier = Total Bet"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-2 py-2">{row.name}</td>
                    <td className="text-center">
                      <Switch
                        checked={row.enabled}
                        onCheckedChange={(val) => handleToggle(index, val)}
                      />
                    </td>
                    <td className="text-center">
                      {row.enabled ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.betLevel}
                          onChange={(e) =>
                            handleChangeBet(index, e.target.value)
                          }
                          className="w-24 mx-auto"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      {row.enabled ? getTotalBet(row.betLevel).toFixed(2) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}