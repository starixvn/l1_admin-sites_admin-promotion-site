"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Filter from "./Filter";
import DataGrid from "./DataGrid";

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilterSubmit = async (filters: any) => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      if (filters.status !== "All")
        queryParams.append("status", filters.status);
      if (filters.operator !== "All")
        queryParams.append("operator", filters.operator);
      if (filters.promotionCode)
        queryParams.append("promotionCode", filters.promotionCode);

      const response = await axios.get(
        `/api/promotions?${queryParams.toString()}`
      );
      setPromotions(response.data);
    } catch (err) {
      setError("Failed to fetch promotions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFilterSubmit({ status: "All", operator: "All", promotionCode: "" });
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-100 p-0 m-0">
      <h1 className="text-2xl font-bold mb-6">Promotion Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <Filter onFilterChange={handleFilterSubmit} />
        <DataGrid promotions={promotions} loading={loading} error={error} />
      </div>
    </div>
  );
}
