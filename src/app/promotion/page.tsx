"use client";

import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import Filter from "./Filter";
import DataGrid from "./DataGrid";
import { Game } from "@/types/game";

interface PromotionFilters {
  status: string;
  operator: string[];
  promotionCode: string;
}

export default function PromotionPage() {
  const [promotions, setPromotions] = useState([]);
  const [operators, setOperators] = useState<{ name: string; id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  const handleFilterSubmit = useCallback(async (filters: PromotionFilters) => {
    try {
      setError(null);
      const queryParams = new URLSearchParams();
      if (filters.status !== "All") queryParams.append("status", filters.status);
      if (filters.operator && filters.operator.length > 0 && !filters.operator.includes("All")) {
        filters.operator.forEach((op: string) => {
          queryParams.append("operator", op);
        });
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
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Promotion Management</h1>
      
      {/* Filter section */}
      <div className="w-full bg-white rounded-xl shadow-sm">
        <Filter onFilterChange={handleFilterSubmit} operatorOptions={operators} />
      </div>

      {/* Data grid */}
      <div className="w-full bg-white rounded-xl shadow-sm">
        <DataGrid
          promotions={promotions}
          loading={loading}
          error={error}
          games={games}
        />
      </div>
    </div>
  );
}
