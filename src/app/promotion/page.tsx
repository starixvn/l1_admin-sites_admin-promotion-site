"use client";

import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import Filter from "./Filter";
import DataGrid from "./DataGrid";
import { Game } from "@/types/game";
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Promotion } from "@/types/promotion";

interface PromotionFilters {
  status: string;
  operator: string[];
  promotionCode: string;
}

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [operators, setOperators] = useState<{ name: string; id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPromotionId, setDeletingPromotionId] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<PromotionFilters>({
    status: "All",
    operator: operators.map((op) => op.id),
    promotionCode: ""
  });

  const handleFilterSubmit = useCallback(async (filters: PromotionFilters) => {
    setCurrentFilters(filters);
    try {
      setError(null);
      const queryParams = new URLSearchParams();
      if (filters.status !== "All") queryParams.append("status", filters.status);
      const allOperatorIds = operators.map(op => op.id);
      const isAllSelected =
        filters.operator.length === allOperatorIds.length &&
        allOperatorIds.every(id => filters.operator.includes(id));

      if (filters.operator && filters.operator.length > 0 && !isAllSelected) {
          queryParams.append("operator", filters.operator.toString());
      }
      if (filters.promotionCode) queryParams.append("promotionCode", filters.promotionCode);

      const response = await axios.get(`/api/promotions?${queryParams.toString()}`);
      setPromotions(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "Failed to fetch promotions");
      } else {
        setError("Failed to fetch promotions");
      }
      console.error(error);
    }
  }, []);

  const fetchOperators = useCallback(async () => {
    try {
      const response = await axios.get("/api/operators");
      const operatorsList = response.data.map(
        (op: { Name: string; PartnerId: string }) => ({
          name: op.Name,
          id: op.PartnerId,
        })
      );
      setOperators(operatorsList);
      handleFilterSubmit({
        status: "All",
        operator: operatorsList.map((op: { name: string; id: string }) => op.id),
        promotionCode: "",
      });
    } catch (error) {
      console.error("Failed to fetch operators:", error);
    }
  }, [handleFilterSubmit]);

  const fetchGames = async () => {
    try {
      const response = await axios.get("/api/games");
      setGames(response.data);
    } catch (err) {
      console.error("Failed to fetch games:", err);
    }
  };

  const handleDeleteClick = async (id: string): Promise<void> => {
    setDeletingPromotionId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPromotionId) return;
    
    try {
      await axios.delete(`/api/promotions/${deletingPromotionId}`);
      setPromotions((prev) => prev.filter((p) => p._id !== deletingPromotionId));
      setIsDeleteModalOpen(false);
      toast.success("Promotion deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "Failed to delete promotion");
        toast.error(error.response?.data?.message || "Failed to delete promotion");
      } else {
        setError("Failed to delete promotion");
        toast.error("Failed to delete promotion");
      }
      console.error("Error deleting promotion:", error);
    }
    setDeletingPromotionId(null);
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
  }, [fetchOperators]);

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Promotion Management</h1>
      
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
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPromotionId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Promotion"
        message="Are you sure you want to delete this promotion? This action cannot be undone."
      />
      
      <ToastContainer />
    </div>
  );
}
