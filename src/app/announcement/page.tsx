'use client';
import { useState } from "react";
import Filter from "./Filter";
import DataGrid, { Announcement } from "./DataGrid";

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Hot Slot - Hot Offer Promotion",
    banner: "Get 10 Free Spin Bonus on eligible Slot Games! Take a Chance on Our Most Rewarding Slot Game – Big Wins Await!",
    terms: "Players must complete all pending Free Spins1 (including in-game Free Spins and FSBs from other promotions) before receiving a new Promotion Bonus. When the Promotion ends, all remaining Free Spin Bonus will be lost.",
    displayDate: { from: "10/05/2025 00:00", to: "25/05/2025 00:00" },
    mapping: "Details",
    status: "Running" as const,
  },
  {
    id: "2",
    title: "Summer Free Spin Bonus",
    banner: "Get 60 Free Spins Bonus on eligible Slot Games1! Hurry Up!! Grab It Now While Still Available.",
    terms: "Players must complete all pending Free Spins2 (including in-game Free Spins and FSBs from other promotions) before receiving a new Promotion Bonus. When the Promotion ends, all remaining Free Spin Bonus will be lost.",
    displayDate: { from: "10/04/2025 00:00", to: "20/04/2025 00:00" },
    mapping: "Details",
    status: "Upcoming" as const,
  },
  {
    id: "3",
    title: "Crazy with Slot",
    banner: "Get 10 Free Spins Bonus on eligible Slot Games2! Hurry Up!! Grab It Now While Still Available.",
    terms: "Players must complete all pending Free Spins3 (including in-game Free Spins and FSBs from other promotions) before receiving a new Promotion Bonus. When the Promotion ends, all remaining Free Spin Bonus will be lost.",
    displayDate: { from: "10/04/2025 00:00", to: "20/04/2025 00:00" },
    mapping: "Details",
    status: "Completed" as const,
  }
];


export default function Page() {
  const [status, setStatus] = useState("All");

  const handleFilterChange = (newStatus: string) => setStatus(newStatus);
  const filtered = status === "All" ? mockAnnouncements : mockAnnouncements.filter(a => a.status === status);

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Promotion Announcement</h1>
      <div className="w-full bg-white rounded-xl shadow-sm">
        <Filter status={status} onStatusChange={handleFilterChange} />
      </div>
      <div className="w-full bg-white rounded-xl shadow-sm">
        <DataGrid announcements={filtered} />
      </div>
    </div>
  );
}
