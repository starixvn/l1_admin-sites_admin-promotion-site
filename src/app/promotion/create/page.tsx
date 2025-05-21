'use client';
import { useState } from "react";
import PromotionDialog from "./PromotionDialog"; 
export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-10">
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Open Promotion Dialog
      </button>

      <PromotionDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

