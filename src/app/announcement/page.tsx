'use client';
import { useState, useEffect } from "react";
import Filter from "./Filter";
import DataGrid, { Announcement } from "./DataGrid";
import ConfirmModal from "@/components/ConfirmDialog";
import AnnouncementDialog from "./create/AnnouncementDialog";
import { PAGE_SIZE_OPTIONS } from "@/constants/constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

async function fetchAnnouncements({ status, pageIndex, pageSize }: { status: string, pageIndex: number, pageSize: number }) {
  const params = new URLSearchParams();
  if (status && status !== "All") params.append("status", status.toLowerCase());
  params.append("pageIndex", String(pageIndex));
  params.append("pageSize", String(pageSize));
  const res = await fetch(`/api/announcement?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export default function Page() {
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editAnnouncement, setEditAnnouncement] = useState<any | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    setError(null);
    fetchAnnouncements({ status, pageIndex: currentPage, pageSize })
      .then((data) => {
        setAnnouncements(data.items || data.data || []);
        setTotalItems(data.metadata?.total || data.total || 0);
        setCurrentPage(data.metadata?.pageIndex || 1);
      })
      .catch((err) => setError(err.message))
  }, [status, currentPage, pageSize]);

  const handleFilterChange = (newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/announcement/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast.success("Promotion deleted successfully");
      fetchAnnouncements({ status, pageIndex: 1, pageSize })
        .then((data) => {
          setAnnouncements(data.items || data.data || []);
          setTotalItems(data.metadata?.total || data.total || 0);
          setCurrentPage(data.metadata?.pageIndex || 1);
        });
    } catch (err: any) {
      toast.error(err.message || 'Delete failed!');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
      setDeleteTitle(null);
    }
  };

  const reloadAnnouncements = () => {
    fetchAnnouncements({ status, pageIndex: 1, pageSize })
      .then((data) => {
        setAnnouncements(data.items || data.data || []);
        setTotalItems(data.metadata?.total || data.total || 0);
        setCurrentPage(data.metadata?.pageIndex || 1);
      });
  };

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Promotion Announcement</h1>
      <div className="w-full bg-white rounded-xl shadow-sm">
        <Filter
          status={status}
          pageSize={pageSize}
          onStatusChange={handleFilterChange}
          onAddNew={() => { setOpenDialog(true); setEditAnnouncement(null); }}
        />
      </div>
      <div className="w-full bg-white rounded-xl shadow-sm">
        <DataGrid
          announcements={announcements}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          onDelete={handleDeleteClick}
          onEdit={(announcement) => { setEditAnnouncement(announcement); setDialogMode('edit'); setOpenDialog(true); }}
          onView={(announcement) => { setEditAnnouncement(announcement); setDialogMode('view'); setOpenDialog(true); }}
        />
        {error && <div className="text-center py-4 text-red-500">{error}</div>}
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
      <AnnouncementDialog open={openDialog} onClose={() => setOpenDialog(false)} onCreated={reloadAnnouncements} announcement={editAnnouncement} mode={editAnnouncement ? dialogMode : 'create'} />
      <ToastContainer />
    </div>
  );
}
