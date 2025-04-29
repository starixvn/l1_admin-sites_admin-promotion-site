"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Filter from "./Filter";
import DataGrid from "./DataGrid";
import { Game } from "@/types/game";

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [operators, setOperators] = useState<{ name: string; id: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  // Fetch operators
  const fetchOperators = async () => {
    try {
      const response = await axios.get("/api/operators");
      const operatorsList = response.data.map(
        (op: { Name: string; PartnerId: string }) => ({
          name: op.Name,
          id: op.PartnerId,
        })
      );
      setOperators(operatorsList);
      // Call handleFilterSubmit after operators are fetched
      handleFilterSubmit({
        status: "All",
        operator: operatorsList.map((op: { id: string }) => op.id),
        promotionCode: "",
      });
    } catch (err) {
      console.error("Failed to fetch operators:", err);
    }
  };

  const handleFilterSubmit = async (filters: any) => {
    try {
      setError(null);
      const queryParams = new URLSearchParams();
      if (filters.status !== "All")
        queryParams.append("status", filters.status);
      // Xử lý multiple select operators
      if (
        filters.operator &&
        filters.operator.length > 0 &&
        !filters.operator.includes("All")
      ) {
        filters.operator.forEach((op: string) => {
          queryParams.append("operator", op);
        });
      }
      if (filters.promotionCode)
        queryParams.append("promotionCode", filters.promotionCode);

      const response = await axios.get(
        `/api/promotions?${queryParams.toString()}`
      );
      setPromotions(response.data);
    } catch (err) {
      setError("Failed to fetch promotions");
      console.error(err);
    }
  };

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
    <div className="min-h-screen w-full bg-gray-100 p-5">
      <h1 className="text-2xl font-bold mb-6">Promotion Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <Filter
          onFilterChange={handleFilterSubmit}
          operatorOptions={operators}
        />
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
