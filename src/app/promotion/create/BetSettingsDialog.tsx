"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { useState } from "react";

const mockData = [
  { currency: "Cash_INH", bet: 0.01 },
  { currency: "Cash_10Base", bet: 0.1 },
  { currency: "Cash_EURO", bet: 0.5 },
  { currency: "Cash_Indo", bet: 1 },
  { currency: "Cash_Thai", bet: 0.1 },
  { currency: "Cash_Korea", bet: 10 },
  { currency: "Cash_Asia" },
  { currency: "Cash_0.1Base" },
  { currency: "Cash_2Base" },
  { currency: "Cash_5Base" },
];

export default function BetSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(
    mockData.map((item) => ({
      ...item,
      enabled: false,
      level: item.bet || "",
    }))
  );

  const toggleAll = (checked: boolean) => {
    setRows((r) =>
      r.map((row) => ({
        ...row,
        enabled: checked,
        level: checked && row.bet ? row.bet : "",
      }))
    );
  };

  const updateLevel = (idx: number, value: string) => {
    setRows((r) => {
      const copy = [...r];
      copy[idx].level = value;
      return copy;
    });
  };

  const getTotal = (level: string | number) => {
    const val = parseFloat(level as string);
    return isNaN(val) ? "" : (val * 25).toFixed(2); // Classic: x25
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed inset-0 flex items-center justify-center z-[9999]">
        <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl p-6">
          <DialogHeader>
            <DialogTitle>Bet Setting pop-up for Classic Slot</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>**</strong> Turn ON the Promotion for the currency group
              which you want to offer the Free Spin Bonus.
            </p>
            <p>
              The suggested Bet Level amount is based on the default setting
              currently displayed in the game for each currency group.
            </p>
          </div>

          <div className="border rounded mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Operators</th>
                  <th className="p-2 text-left">Currency Group</th>
                  <th className="p-2 text-center">
                    Status
                    <div className="text-xs font-normal">
                      <Switch onCheckedChange={toggleAll} /> Enable All
                    </div>
                  </th>
                  <th className="p-2 text-center">Bet Level</th>
                  <th className="p-2 text-center">
                    Total Bet
                    <Info className="inline ml-1 w-4 h-4 text-gray-400 cursor-pointer" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.currency} className="border-t">
                    <td className="p-2">ONEworksVGCash</td>
                    <td className="p-2">{row.currency}</td>
                    <td className="p-2 text-center">
                      <Switch
                        checked={row.enabled}
                        onCheckedChange={(v) => {
                          const updated = [...rows];
                          updated[i].enabled = v;
                          updated[i].level = v && row.bet ? row.bet : "";
                          setRows(updated);
                        }}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Input
                        type="number"
                        className="h-8 w-24 text-center"
                        disabled={!row.enabled}
                        value={row.level}
                        onChange={(e) => updateLevel(i, e.target.value)}
                      />
                    </td>
                    <td className="p-2 text-center">
                      {row.enabled ? getTotal(row.level) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
            <div className="space-x-2">
              <Button variant="secondary">Save & Continue</Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
