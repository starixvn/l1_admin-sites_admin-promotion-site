'use client';
import { useState, useEffect } from "react";
import Filter from "./Filter";
import DataGrid from "./DataGrid";
import { Announcement, PromotionMapping } from "@/types/announcement";
import { Operator } from "@/types/operator";
import { Promotion } from "@/types/promotion";
import ConfirmModal from "@/components/ConfirmDialog";
import AnnouncementDialog from "./create/AnnouncementDialog";
import { PAGE_SIZE_OPTIONS } from "@/constants/constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PromotionMappingDialog from "./create/PromotionMappingDialog";

async function fetchAnnouncements({ status, pageIndex, pageSize }: { status: string, pageIndex: number, pageSize: number }) {
  const params = new URLSearchParams();
  if (status && status !== "All") {
    params.append("status", status.toLowerCase());
  }
  params.append("pageIndex", String(pageIndex));
  params.append("pageSize", String(pageSize));
  const res = await fetch(`/api/announcement?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch announcements");
  }
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
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [openMappingDialog, setOpenMappingDialog] = useState(false);
  const [mappingData, setMappingData] = useState<PromotionMapping[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

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

  useEffect(() => {
    if (openMappingDialog) {
      fetch("/api/operators").then(res => res.json()).then(setOperators);
      fetch("/api/promotions?pageIndex=1&pageSize=1000")
        .then(res => res.json())
        .then(data => setPromotions(data.items || data.data || []));
    }
  }, [openMappingDialog]);

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
    if (!deleteId) {
      return;
    }
    try {
      const res = await fetch(`/api/announcement/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Delete failed');
      }
      toast.success("Promotion deleted successfully");
      fetchAnnouncements({ status, pageIndex: 1, pageSize })
        .then((data) => {
          setAnnouncements(data.items || data.data || []);
          setTotalItems(data.metadata?.total || data.total || 0);
          setCurrentPage(data.metadata?.pageIndex || 1);
        });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        toast.error((err as { message?: string }).message || 'Delete failed!');
      } else {
        toast.error('Delete failed!');
      }
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

  const handlePromotionMappingDetail = (mappings: PromotionMapping[]) => {
    setMappingData(mappings);
    setOpenMappingDialog(true);
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
          onPromotionMappingDetail={handlePromotionMappingDetail}
        />
        {error && <div className="text-center py-4 text-red-500">{error}</div>}
      </div>
      <ConfirmModal
        open={showConfirm}
        title={<span style={{ color: 'red', fontWeight: 700 }}>Confirm Deletion</span>}
        message={`
          <div>
            Are you sure you want to delete the Announcement <strong style='color: black; font-weight: 600;'>${deleteTitle}</strong>?
          </div>
          <br />
          <div>
            <strong>Reminder:</strong> All promotion events currently mapped to this announcement will not run until they are mapped to a different announcement.
          </div>
        `}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
      <AnnouncementDialog open={openDialog} onClose={() => setOpenDialog(false)} onCreated={reloadAnnouncements} announcement={editAnnouncement ?? undefined} mode={editAnnouncement ? dialogMode : 'create'} />
      <PromotionMappingDialog
        open={openMappingDialog}
        onClose={() => setOpenMappingDialog(false)}
        mappings={mappingData}
        operators={operators}
        promotions={promotions}
      />
      <ToastContainer />
    </div>
  );
}
