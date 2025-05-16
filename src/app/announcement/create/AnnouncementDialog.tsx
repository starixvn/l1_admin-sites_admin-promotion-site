import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import AnnouncementForm from "./AnnouncementForm";

export default function AnnouncementDialog({ open, onClose, onCreated, announcement, mode = 'create' }: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  announcement?: any;
  mode?: 'create' | 'edit';
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[850px] max-w-[72rem] p-0 bg-white rounded-2xl shadow-2xl border-0 max-h-[100vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b">
          <DialogTitle asChild>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Announcement' : 'Add New Announcement'}
            </h2>
          </DialogTitle>
        </div>
        {/* Stepper & Form */}
        <AnnouncementForm onClose={onClose} onCreated={onCreated} initialValues={announcement} mode={mode} />
      </DialogContent>
    </Dialog>
  );
}