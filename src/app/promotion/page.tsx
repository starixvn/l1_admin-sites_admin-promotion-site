"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Filter from "./Filter";
import DataGrid from "./DataGrid";
import ConfirmModal from "@/components/ConfirmDialog";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Promotion } from "@/types/promotion";
import { Operator } from "@/types/operator";
import { PROMOTION_FILTERS_KEY } from "@/constants/constants";

interface PromotionFilters {
  status: string;
  operator: string[];
  promotionCode: string;
  pageIndex: number;
  pageSize: number;
}

function PromotionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPromotionId, setDeletingPromotionId] = useState<string | null>(
    null
  );
  const [deletingPromotionCode, setDeletingPromotionCode] = useState<
    string | null
  >(null);
  const [currentFilters, setCurrentFilters] = useState<PromotionFilters>({
    status: "All",
    operator: [],
    promotionCode: "",
    pageIndex: 1,
    pageSize: 10,
  });

  const handlePerformanceClick = (promotionId: string) => {
    // Save current filters to localStorage before navigation
    if (typeof window !== "undefined") {
      localStorage.setItem(
        PROMOTION_FILTERS_KEY,
        JSON.stringify(currentFilters)
      );
    }
    router.push(`/promotion/performance/${promotionId}`);
  };

  // Memoize the filter handler to prevent unnecessary re-renders
  const handleFilterSubmit = useCallback(
    async (filters: PromotionFilters) => {
      setCurrentFilters(filters);
      try {
        setError(null);
        const queryParams = new URLSearchParams();

        if (filters.status !== "All") {
          queryParams.append("status", filters.status);
        }

        if (filters.operator?.length > 0) {
          queryParams.append("operator", filters.operator.toString());
        }

        if (filters.promotionCode) {
          queryParams.append("promotionCode", filters.promotionCode);
        }

        queryParams.append("pageIndex", filters.pageIndex.toString());
        queryParams.append("pageSize", filters.pageSize.toString());

        const response = await axios.get(
          `/api/promotions?${queryParams.toString()}`
        );
        setPromotions(response.data.items);
        setTotalItems(response.data.metadata.total);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch promotions");
      }
    },
    [operators]
  );

  // Load filters from sessionStorage and fetch operators on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        let initialFilters = currentFilters;
        // Check URL params first
        const urlStatus = searchParams.get("status");
        const urlOperator = searchParams.get("operator");
        const urlPromotionCode = searchParams.get("promotionCode");
        const urlPageIndex = searchParams.get("pageIndex");
        const urlPageSize = searchParams.get("pageSize");

        if (
          urlStatus ||
          urlOperator ||
          urlPromotionCode ||
          urlPageIndex ||
          urlPageSize
        ) {
          initialFilters = {
            status: urlStatus || "All",
            operator: urlOperator ? urlOperator.split(",") : [],
            promotionCode: urlPromotionCode || "",
            pageIndex: parseInt(urlPageIndex || "1"),
            pageSize: parseInt(urlPageSize || "10"),
          };
          setCurrentFilters(initialFilters);
        }

        const response = await axios.get("/api/operators");
        const operatorsList = response.data.map((op: Operator) => ({
          Name: op.Name,
          PartnerId: op.PartnerId,
        }));
        setOperators(operatorsList);

        // Set initial operator filter only if empty and no stored filters
        if (initialFilters.operator.length === 0) {
          const newFilters = {
            ...initialFilters,
            operator: operatorsList.map((op: Operator) => op.PartnerId),
          };
          setCurrentFilters(newFilters);
          handleFilterSubmit(newFilters);
        } else {
          // If we have stored filters, fetch data with those filters
          handleFilterSubmit(initialFilters);
        }
      } catch (error) {
        console.error("Failed to fetch operators:", error);
        setError("Failed to fetch operators");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []); // Empty dependency array - only run on mount

  const handlePageChange = useCallback(
    (newPage: number) => {
      handleFilterSubmit({
        ...currentFilters,
        pageIndex: newPage,
      });
    },
    [currentFilters, handleFilterSubmit]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      handleFilterSubmit({
        ...currentFilters,
        pageSize: size,
        pageIndex: 1,
      });
    },
    [currentFilters, handleFilterSubmit]
  );

  const handleDeleteClick = useCallback(async (id: string, code: string) => {
    setDeletingPromotionId(id);
    setDeletingPromotionCode(code);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingPromotionId) {
      return;
    }

    try {
      await axios.delete(`/api/promotions/${deletingPromotionId}`);
      setPromotions((prev) =>
        prev.filter((p) => p._id !== deletingPromotionId)
      );
      setIsDeleteModalOpen(false);
      toast.success("Promotion deleted successfully");
      handleFilterSubmit(currentFilters); // Refresh the list
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Failed to delete promotion");
    } finally {
      setDeletingPromotionId(null);
      setDeletingPromotionCode(null);
    }
  }, [deletingPromotionId, currentFilters, handleFilterSubmit]);

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Promotion Management
      </h1>

      {/* Filter section */}
      <div className="w-full bg-white rounded-xl shadow-sm">
        <Filter
          onFilterChange={handleFilterSubmit}
          operatorOptions={operators}
          initialFilters={currentFilters}
        />
      </div>

      {/* Data grid */}
      <div className="w-full bg-white rounded-xl shadow-sm">
        <DataGrid
          promotions={promotions}
          loading={loading}
          error={error}
          onDelete={handleDeleteClick}
          onRefresh={() => handleFilterSubmit(currentFilters)}
          currentPage={currentFilters.pageIndex}
          pageSize={currentFilters.pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onPerformanceClick={handlePerformanceClick}
        />
      </div>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete promotion with code <strong style="color: black; font-weight: 600;">${deletingPromotionCode}</strong>? 
        This action is permanent and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingPromotionId(null);
          setDeletingPromotionCode(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <ToastContainer />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <PromotionPage />
    </Suspense>
  );
}
