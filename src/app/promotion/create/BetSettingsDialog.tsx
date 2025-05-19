"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GAME_TYPES } from "@/constants/gameTypes";
import { CurrencyGroup } from "@/types/currency-group";
import { useCurrencyGroupGames } from "@/hooks/useCurrencyGroupGames";
import { Game } from "@/types/game";
import {
  selectSuggestedBetLevel,
  validateBetRows,
  getTotalBet,
  createOperatorMap,
} from "@/lib/promotion/bet-settings.utils";
import { Operator } from "@/types/operator";

type Props = {
  open: boolean;
  onClose: () => void;
  partnerId: string;
  gameType: number;
  currencyGroupsInfo: CurrencyGroup[];
  onSave: (data: {
    currencyGroups: string[];
    betLevels: { currencyGroup: string; betLevel: number }[];
  }) => void;
  games?: Game[];
  operators?: Operator[];
  readonly?: boolean;
  initialValues?: {
    currencyGroup: string;
    betLevel: number;
  }[];
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
  currencyGroupsInfo,
  onSave,
  games,
  operators,
  readonly = false,
  initialValues,
}: Props) {
  const [rows, setRows] = useState<RowState[]>([]);
  const { mutateAsync: getCurrencyGroupGames } = useCurrencyGroupGames();
  const memoizedGameIds = useMemo(() => games?.map((g) => g.GameId), [games]);
  const [invalidRows, setInvalidRows] = useState<Set<string>>(new Set());
  const [showGlobalError, setShowGlobalError] = useState(false);
  const [enableAll, setEnableAll] = useState(false);

  const memoizedGetCurrencyGroupGames = useCallback(getCurrencyGroupGames, []);
  const operatorMap = useMemo(
    () => createOperatorMap(operators || []),
    [operators]
  );
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!open || !currencyGroupsInfo?.length) {
        return;
      }
      setShowGlobalError(false);
      setInvalidRows(new Set());
      const initialBetMap = new Map<string, number>();
      if (initialValues) {
        for (const b of initialValues) {
          initialBetMap.set(b.currencyGroup, b.betLevel);
        }
      }

      try {
        const mapped = await Promise.all(
          currencyGroupsInfo.map(async (cg: CurrencyGroup) => {
            const existingBetLevel = initialBetMap.get(cg.Id);
            const groupGames = await memoizedGetCurrencyGroupGames(cg.Id);
            const betLevel =
              existingBetLevel ??
              selectSuggestedBetLevel(gameType, groupGames, memoizedGameIds);

            return {
              id: cg.Id,
              name: cg.Name,
              enabled: existingBetLevel !== undefined,
              betLevel,
            };
          })
        );

        if (isMounted) {
          const allEnabled = mapped.every((r) => r.enabled);
          setEnableAll(allEnabled);
          setRows(mapped);
        }
      } catch (error) {
        console.error("Error fetching currency group games:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [open, currencyGroupsInfo, memoizedGetCurrencyGroupGames, initialValues]);

  const handleToggleAll = async (enabled: boolean) => {
    if (readonly) {
      return;
    }
    setEnableAll(enabled);

    const updatedRows = await Promise.all(
      rows.map(async (row) => {
        let betLevel = row.betLevel;
        if (enabled && !betLevel) {
          const groupGames = await memoizedGetCurrencyGroupGames(row.id);
          betLevel = selectSuggestedBetLevel(
            gameType,
            groupGames,
            memoizedGameIds
          );
        }

        return {
          ...row,
          enabled,
          betLevel: enabled && !row.betLevel ? betLevel : row.betLevel,
        };
      })
    );

    setRows(updatedRows);
  };

  const handleToggle = async (index: number, enabled: boolean) => {
    if (readonly) {
      return;
    }
    let suggested = rows[index].betLevel;
    if (enabled && !suggested) {
      const groupGames = await memoizedGetCurrencyGroupGames(rows[index].id);
      suggested = selectSuggestedBetLevel(
        gameType,
        groupGames,
        memoizedGameIds
      );
    }
    setRows((prev) => {
      const updated = [...prev];
      updated[index].enabled = enabled;
      if (enabled && !updated[index].betLevel) {
        updated[index].betLevel = suggested;
      }
      const total = updated.length;
      const enabledCount = updated.filter((r) => r.enabled).length;
      setEnableAll(enabledCount === total);
      return updated;
    });
  };

  const handleChangeBet = (index: number, value: string) => {
    if (readonly) {
      return;
    }
    const num = parseFloat(value);

    setRows((prev) => {
      const updated = [...prev];
      updated[index].betLevel = isNaN(num) ? 0 : num;
      return updated;
    });
  };

  const handleSave = () => {
    const enabledRows = rows.filter((r) => r.enabled);

    // ❗ 1. Không có nhóm nào được bật
    if (enabledRows.length === 0) {
      setInvalidRows(new Set()); // clear possible old state
      setShowGlobalError(true);
      return;
    }

    // ❗ 2. Có nhóm bật nhưng betLevel không hợp lệ
    const newInvalidRows = validateBetRows(enabledRows);

    if (newInvalidRows.size > 0) {
      setInvalidRows(newInvalidRows);
      setShowGlobalError(true);
      return;
    }

    // ✅ 3. Hợp lệ, tiến hành lưu
    setInvalidRows(new Set());
    setShowGlobalError(false);

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
      <DialogContent aria-describedby={undefined} className="w-full !max-w-3xl bg-white rounded-xl px-3 py-0 shadow-xl max-h-[90vh] flex flex-col">
        <div className="p-3 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Currency Group Settings -{" "}
            {gameType === GAME_TYPES.CLASSIC
              ? "Classic Slot"
              : "Cascading Slot"}
          </DialogTitle>
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <div className="space-y-6 mt-4">
            {!readonly && (
              <p className="text-sm text-gray-700">
                <strong className="text-red-500">**</strong> Turn ON the
                Promotion for the currency group which you want to offer the
                Free Spin Bonus
              </p>
            )}
            <p className="text-sm text-gray-700">
              The suggested Bet Level value is based on the default setting
              currently displayed in the game for each currency group.{" "}
            </p>
            <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-100 text-blue-900 border-b text-sm">
                    <th className="px-4 py-3 text-center border-r">Operator</th>
                    <th className="px-4 py-3 text-center border-r">
                      Currency Group
                    </th>
                    <th className="px-4 py-3 text-center border-r">
                      <div className="flex flex-col items-center gap-1">
                        <span>Status</span>
                        <div
                          className={`w-16 h-7 rounded-full flex items-center transition-colors duration-300 px-1 cursor-pointer ${
                            enableAll
                              ? "bg-green-500 justify-end"
                              : "bg-gray-300 justify-start"
                          }`}
                          onClick={() => handleToggleAll(!enableAll)}
                        >
                          <div className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-sm">
                            {enableAll ? "✔" : ""}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 mt-1">
                          Enable All
                        </span>
                      </div>
                    </th>

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
                              className="z-50 text-xs bg-white shadow-lg border"
                            >
                              {gameType === GAME_TYPES.CLASSIC
                                ? "Classic: Bet Level x25 = Total Bet"
                                : "Cascading: Coin Value x Bet Level (1) x Multiplier (20) = Total Bet"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className="border-t text-sm">
                      {index === 0 && (
                        <td
                          className="px-4 py-3 text-gray-600 text-center border-r"
                          rowSpan={rows.length}
                          style={{ verticalAlign: "middle" }}
                        >
                          <div className="h-full flex items-center justify-center font-semibold">
                            {operatorMap.get(partnerId) || partnerId}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 border-r">{row.name}</td>
                      <td className="text-center border-r">
                        <div
                          data-testid="toggle-button"
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
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e") {
                                  e.preventDefault();
                                }
                              }}
                              onPaste={(e) => {
                                const paste = e.clipboardData.getData("text");
                                if (
                                  paste.includes("-") ||
                                  parseFloat(paste) < 0
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              disabled={readonly}
                              className={`w-28 h-10 text-center text-base px-0 rounded-lg border transition ${
                                invalidRows.has(row.id)
                                  ? "border-red-500 focus:border-red-600 focus:ring-red-200"
                                  : "border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              }`}
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-center font-semibold">
                        {row.enabled
                          ? getTotalBet(row.betLevel, gameType).toFixed(2)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 flex justify-end">
          <div className="flex justify-end gap-4 pt-3">
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

        {showGlobalError && (
          <div className="absolute bottom-7 left-6 text-red-600 text-xs font-medium">
            {rows.every((r) => !r.enabled)
              ? "❗ At least one currency group must be enabled for the promotion."
              : `❗ Please make sure all enabled rows have ${
                  gameType === GAME_TYPES.CLASSIC ? "Bet Level" : "Coin Value"
                } greater than 0`}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
