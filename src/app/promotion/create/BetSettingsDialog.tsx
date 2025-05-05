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
  readonly?: boolean;
  initialValues?: {
    betLevels: {
      currencyGroup: string;
      betLevel: number;
    }[];
  };
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
  readonly = false,
  initialValues,
}: Props) {
  const { data: currencyGroups = [] } = useCurrencyGroups(partnerId);
  const [rows, setRows] = useState<RowState[]>([]);

  useEffect(() => {
    if (currencyGroups.length > 0) {
      const initialBetMap = new Map<string, number>();
      if (initialValues?.betLevels) {
        for (const b of initialValues.betLevels) {
          initialBetMap.set(b.currencyGroup, b.betLevel);
        }
      }
      setRows(
        currencyGroups.map((cg: CurrencyGroup) => {
          const betLevel = initialBetMap.get(cg.Id);
          return {
            id: cg.Id,
            name: cg.Name,
            enabled: betLevel !== undefined,
            betLevel: betLevel ?? getSuggestedBetLevel(gameType),
          };
        })
      );
    }
  }, [currencyGroups, gameType, initialValues]);

  const getSuggestedBetLevel = (type: number) => {
    return type === GAME_TYPES.CASCADING ? 1 : 0.1;
  };

  const getTotalBet = (betLevel: number) => {
    return gameType === GAME_TYPES.CASCADING
      ? 1 * betLevel * 20
      : betLevel * 25;
  };

  const handleToggle = (index: number, enabled: boolean) => {
    if (readonly) return;
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
    if (readonly) return;
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
      <DialogContent className="w-full !max-w-6xl bg-gradient-to-b from-white via-blue-50 to-blue-100 rounded-3xl p-12 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-800">
            Bet Settings -{" "}
            {gameType === GAME_TYPES.CLASSIC
              ? "Classic Slot"
              : "Cascading Slot"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <p className="text-base text-gray-700">
            <strong className="text-red-500">**</strong> Enable Free Spin Bonus
            for selected currency groups below.
          </p>

          <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
            <table className="w-full text-base border-collapse border border-blue-200">
              <thead>
                <tr className="bg-blue-100 text-blue-900 border-b text-lg">
                  <th className="px-4 py-3 text-center border-r">Operator</th>
                  <th className="px-4 py-3 text-center border-r">
                    Currency Group
                  </th>
                  <th className="px-4 py-3 text-center border-r">Status</th>
                  <th className="px-4 py-3 text-center border-r">
                    {gameType === GAME_TYPES.CLASSIC
                      ? "Bet Level"
                      : "Coin Value"}
                  </th>
                  <th className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      Total Bet
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-5 h-5 text-blue-600" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="z-50 text-sm bg-white shadow-lg border"
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
                  <tr key={row.id} className="border-t text-base">
                    {index === 0 && (
                      <td
                        className="px-4 py-3 text-gray-600 text-center border-r"
                        rowSpan={rows.length}
                        style={{ verticalAlign: "middle" }}
                      >
                        <div className="h-full flex items-center justify-center font-semibold">
                          {partnerId}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 border-r">{row.name}</td>
                    <td className="text-center border-r">
                      <div
                        className={`w-12 h-7 rounded-full flex items-center transition-colors duration-300 px-1 cursor-pointer ${
                          row.enabled
                            ? "bg-green-500 justify-end mx-auto"
                            : "bg-gray-300 justify-start mx-auto"
                        } ${readonly ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleToggle(index, !row.enabled)}
                      >
                        <div className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
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
                            disabled={readonly}
                            className="w-28 h-10 bg-white text-center text-base px-0 rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="text-center font-semibold">
                      {row.enabled ? getTotalBet(row.betLevel).toFixed(2) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" onClick={onClose} className="btn-cancel">
              Close
            </Button>
            {!readonly && (
              <Button
                type="submit"
                onClick={handleSave}
                className="btn-primary"
              >
                Save
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
