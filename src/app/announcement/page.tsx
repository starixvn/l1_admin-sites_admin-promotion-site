'use client';
import { useState } from "react";
import Filter from "./Filter";
import DataGrid, { Announcement } from "./DataGrid";
import ConfirmModal from "@/components/ConfirmDialog";

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Hot Slot - Hot Offer Promotion",
    banner: "https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg",
    terms: "Players must complete all pending Free Spins1 (including in-game Free Spins and FSBs from other promotions) before receiving a new Promotion Bonus. When the Promotion ends, all remaining Free Spin Bonus will be lost.",
    displayDate: { from: "10/05/2025 00:00", to: "25/05/2025 00:00" },
    mapping: "Details",
    status: "Running" as const,
  },
  {
    id: "2",
    title: "Summer Free Spin Bonus",
    banner: "https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg",
    terms: "Players must complete all pending Free Spins2 (including in-game Free Spins and FSBs from other promotions) before receiving a new Promotion Bonus. When the Promotion ends, all remaining Free Spin Bonus will be lost.",
    displayDate: { from: "10/04/2025 00:00", to: "20/04/2025 00:00" },
    mapping: "Details",
    status: "Upcoming" as const,
  },
  {
    id: "3",
    title: "Crazy with Slot",
    banner: "https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg",
    terms: "Players must complete all pending Free Spins3 (including in-game Free Spins and FSBs from other promotions) before receiving a new Promotion Bonus. When the Promotion ends, all remaining Free Spin Bonus will be lost.",
    displayDate: { from: "10/04/2025 00:00", to: "20/04/2025 00:00" },
    mapping: "Details",
    status: "Completed" as const,
  }
];

export default function Page() {
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFilterChange = (newStatus: string) => setStatus(newStatus);
  const filtered = status === "All" ? mockAnnouncements : mockAnnouncements.filter(a => a.status === status);
  const totalItems = filtered.length;
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = () => {
    // Xóa khỏi mock (demo)
    // Thực tế sẽ gọi API xóa
    setShowConfirm(false);
  };

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Promotion Announcement</h1>
      <div className="w-full bg-white rounded-xl shadow-sm">
        <Filter status={status} onStatusChange={handleFilterChange} />
      </div>
      <div className="w-full bg-white rounded-xl shadow-sm">
        <DataGrid
          announcements={paged}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onDelete={handleDeleteClick}
        />
      </div>
      <ConfirmModal
        open={showConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete announcement <strong style='color: black; font-weight: 600;'>${deleteTitle}</strong>? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
