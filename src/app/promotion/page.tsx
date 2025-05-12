"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Filter from "./Filter";
import DataGrid from "./DataGrid";
import { Game } from "@/types/game";
import ConfirmModal from "@/components/ConfirmModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Promotion } from "@/types/promotion";
import { Operator } from "@/types/operator";

interface PromotionFilters {
  status: string;
  operator: string[];
  promotionCode: string;
  pageIndex: number;
  pageSize: number;
}

interface OperatorDisplay {
  name: string;
  id: string;
}

export default function Page() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [operators, setOperators] = useState<OperatorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPromotionId, setDeletingPromotionId] = useState<string | null>(
    null
  );
  const [deletingPromotionCode, setDeletingPromotionCode] = useState<string | null>(
    null
  );
  const [currentFilters, setCurrentFilters] = useState<PromotionFilters>({
    status: "All",
    operator: [],
    promotionCode: "",
    pageIndex: 1,
    pageSize: 10
  });

  const handleFilterSubmit = useCallback(async (filters: PromotionFilters) => {
    setCurrentFilters((prev) => ({
      ...filters,
      pageSize: filters.pageSize || prev.pageSize,
    }));
    try {
      setError(null);
      const queryParams = new URLSearchParams();
      if (filters.status !== "All") {
        queryParams.append("status", filters.status);
      }

      if (filters.operator && filters.operator.length > 0) {
        const allOperatorIds = operators.map((op) => op.id);
        const isAllSelected =
          filters.operator.length === allOperatorIds.length &&
          allOperatorIds.every((id) => filters.operator.includes(id));

        if (!isAllSelected) {
          queryParams.append("operator", filters.operator.toString());
        }
      }

      if (filters.promotionCode) {
        queryParams.append("promotionCode", filters.promotionCode);
      }

      queryParams.append("pageIndex", filters.pageIndex.toString());
      queryParams.append("pageSize", (filters.pageSize || currentFilters.pageSize).toString());

      const response = await axios.get(
        `/api/promotions?${queryParams.toString()}`
      );
      setPromotions(response.data.items);
      setTotalItems(response.data.metadata.total);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    handleFilterSubmit({
      ...currentFilters,
      pageIndex: newPage
    });
  };

  const handlePageSizeChange = (size: number) => {
    handleFilterSubmit({
      ...currentFilters,
      pageSize: size,
      pageIndex: 1,
    });
  }

  const fetchOperators = useCallback(async () => {
    try {
      const response = await axios.get("/api/operators");
      const operatorsList = response.data.map((op: Operator) => ({
        name: op.Name,
        id: op.PartnerId,
      }));
      setOperators(operatorsList);
      
      const newFilters = {
        ...currentFilters,
        operator: operatorsList.map((op: OperatorDisplay) => op.id)
      };
      setCurrentFilters(newFilters);
      handleFilterSubmit(newFilters);
    } catch (error) {
      console.error("Failed to fetch operators:", error);
    }
  }, [currentFilters, handleFilterSubmit]);

  const fetchGames = async () => {
    try {
      const response = await axios.get("/api/games");
      setGames(response.data);
    } catch (err) {
      console.error("Failed to fetch games:", err);
    }
  };

  const handleDeleteClick = async (id: string, code: string): Promise<void> => {
    setDeletingPromotionId(id);
    setDeletingPromotionCode(code);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPromotionId) {
      return;
    }

    try {
      await axios.delete(`/api/promotions/${deletingPromotionId}`);
      setPromotions((prev) =>
        prev.filter((p) => p._id !== deletingPromotionId)
      );
      setIsDeleteModalOpen(false);
      toast.success("Promotion deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error deleting promotion:", error);
    }
    setDeletingPromotionId(null);
    setDeletingPromotionCode(null);
  };

  useEffect(() => {
    setLoading(true);
    const initializeData = async () => {
      try {
        await Promise.all([fetchOperators(), fetchGames()]);
      } catch (err) {
        console.error("Error initializing data:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

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
          games={games}
          onDelete={handleDeleteClick}
          onRefresh={() => handleFilterSubmit(currentFilters)}
          currentPage={currentFilters.pageIndex}
          pageSize={currentFilters.pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete promotion with code <strong style="color: black; font-weight: 600;">${deletingPromotionCode}</strong>? This action cannot be undone.`}
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
