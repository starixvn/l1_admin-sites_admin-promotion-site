"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="max-w-4xl bg-white rounded-xl shadow-xl px-6 py-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Bet Setting pop-up for{" "}
            {gameType === GAME_TYPES.CLASSIC
              ? "Classic Slot"
              : "Cascading Slot"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">
            <strong className="text-red-500">**</strong> Turn ON the Promotion
            for the currency group which you want to offer the Free Spin Bonus.
          </p>

          <div className="overflow-x-auto border rounded-md bg-gray-50">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b">
                  <th className="px-3 py-2 text-left border-r">Operator</th>
                  <th className="px-3 py-2 text-left border-r">
                    Currency Group
                  </th>
                  <th className="px-3 py-2 text-center border-r">Status</th>
                  <th className="px-3 py-2 text-center border-r">Bet Level</th>
                  <th className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      Total Bet
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="z-50 text-xs bg-white shadow-lg border"
                          >
                            {gameType === GAME_TYPES.CLASSIC
                              ? "Classic: Bet Level x 25 = Total Bet"
                              : "Cascading: Coin Value x Bet Level x Multiplier = Total Bet"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-t">
                    {index === 0 ? (
                      <td
                        className="px-3 py-2 text-gray-600 text-center border-r"
                        rowSpan={rows.length}
                        style={{ verticalAlign: "middle" }}
                      >
                        <div className="h-full flex items-center justify-center">
                          {partnerId}
                        </div>
                      </td>
                    ) : null}
                    <td className="px-3 py-2 border-r">{row.name}</td>
                    <td className="text-center border-r">
                      <div
                        className={`w-10 h-6 rounded-full flex items-center transition-colors duration-300 px-1 cursor-pointer ${
                          row.enabled
                            ? "bg-green-500 justify-end mx-auto"
                            : "bg-gray-300 justify-start mx-auto"
                        }`}
                        onClick={() => handleToggle(index, !row.enabled)}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center">
                          {row.enabled && "✔"}
                        </div>
                      </div>
                    </td>
                    <td className="text-center border-r">
                      {row.enabled ? (
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.betLevel}
                            onChange={(e) =>
                              handleChangeBet(index, e.target.value)
                            }
                            className="w-24 h-9 bg-white text-center no-spinner px-0 text-sm rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Close
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
