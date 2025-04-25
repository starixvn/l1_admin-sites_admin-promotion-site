"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import PromotionForm from "./PromotionForm";

export default function PromotionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Add New Promotion
      </Button>

      <DialogContent  className="!w-screen !h-screen !max-w-none !max-h-none p-0 overflow-hidden bg-[#f8f9fa]">
        <DialogHeader className="sr-only">
          <DialogTitle>Add New Promotion</DialogTitle>
        </DialogHeader>

        {/* Close button top-right */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-10"
          onClick={() => setOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Form content */}
        <PromotionForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
