"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import {
  getProgressColor,
  getStatusColor,
  getStatusDot,
} from "@/helper/common";
import { Download, ExternalLink, Users, Gift } from "lucide-react";
import { toGMTString } from "@/lib/date-time.utils";
import { GMT_OFFSET } from "@/constants/constants";
import { Player } from "@/types/performance-report";
import { roundToDecimals } from "@/lib/promotion/promotion.utils";
import { fuzzySort } from "@/lib/table-utils";
import PaginationControls from "@/components/common/PaginationControls";
import TableHeader from "@/components/common/TableHeader";
import TableBody from "@/components/common/TableBody";
import { Promotion } from "@/types/promotion";
import { getPromotionStatus, PROMOTION_REPORT_STATUS, PROMOTION_STATUS } from "@/constants/promotionStatusMap";
import { useAuth } from "@/lib/auth/AuthContext";

interface PlayersTableProps {
  data: Player[];
  isBaseCurrency: boolean;
  onCurrencyToggle: (isBaseCurrency: boolean) => void;
  metaDataTotalAmount: {
    baseTotalWinAmount: number;
    baseTotalTurnover: number;
    baseTotalBonusClaimed: number;
  };
  pageCount: number;
  totalCount?: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => void;
  isLoading?: boolean;
  onExportPlayers?: () => void;
  promotion?: Promotion;
}

// Basic player information columns
const getBasicPlayerColumns = (router: any, isBaseCurrency: boolean): ColumnDef<Player>[] => [
  {
    accessorKey: "playerId",
    header: "Player ID",
    enableSorting: true,
    size: 100,
    cell: ({ row }) => {
      const playerId = row.getValue("playerId") as string;
      return (
        <div
          className="font-medium truncate max-w-[120px]"
          title={playerId}
        >
          {playerId}
        </div>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
    enableSorting: true,
    size: 120,
    cell: ({ row }) => {
      const username = row.getValue("username") as string;
      const playerId = row.getValue("playerId") as string;
      const handleViewTickets = () => {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const promotionId = pathParts[pathParts.indexOf('performance') + 1];
        const playerPromotionId = row.original.playerPromotionId as string;
        router.push(`/promotion/performance/${promotionId}/players/tickets?playerId=${playerId}&username=${username}&isBaseCurrency=${isBaseCurrency.toString()}&playerPromotionId=${playerPromotionId}`);
      };
      
      return (
        <button
          type="button"
          onClick={handleViewTickets}
          className="font-medium truncate max-w-[120px] text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer flex items-center gap-1 group"
          title={`View tickets for ${username}`}
        >
          <span className="truncate">{username}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0 text-gray-400 group-hover:text-blue-600" />
        </button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    size: 120,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${getStatusDot(status)}`}
          ></div>
          <span className={`text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "siteName",
    header: "SiteName",
    enableSorting: true,
    size: 100,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("siteName")}</div>
    ),
  },
  {
    accessorKey: "displayName",
    header: "Game Name",
    enableSorting: true,
    size: 100,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("displayName")}</div>
    ),
  },
  {
    accessorKey: "currency",
    header: "Currency",
    enableSorting: true,
    size: 100,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("currency")}</div>
    ),
  },
  {
    accessorKey: "dateJoined",
    header: "Date Joined",
    enableSorting: true,
    size: 120,
    cell: ({ row }) => (
      <div>{toGMTString(row.getValue("dateJoined"), GMT_OFFSET)}</div>
    ),
  },
];

// Bonus-related columns
const getBonusColumns = (isBaseCurrency: boolean): ColumnDef<Player>[] => {
  const bonusClaimedKey = isBaseCurrency
    ? "baseBonusClaimed"
    : "bonusClaimed";
  const turnoverKey = isBaseCurrency ? "baseTurnover" : "turnover";
  const bonusWinKey = isBaseCurrency ? "baseBonusWin" : "bonusWin";

  return [
    {
      accessorKey: "remainingBonusItems",
      header: "Remaining FS",
      enableSorting: true,
      size: 100,
      cell: ({ row }) => {
        const remainingBonusItems = row.getValue("remainingBonusItems");
        const initialBonusItem = row.original.initialBonusItem;
        return (
          <div className="font-medium">{`${remainingBonusItems}/${initialBonusItem}`}</div>
        );
      },
    },
    {
      accessorKey: bonusWinKey,
      header: "Bonus Win",
      enableSorting: true,
      size: 100,
      cell: ({ row }) => (
        <div className="font-medium">
          {roundToDecimals(row.getValue(bonusWinKey))}
        </div>
      ),
    },
    {
      accessorKey: turnoverKey,
      header: "Turnover",
      enableSorting: true,
      size: 120,
      cell: ({ row }) => (
        <div className="font-medium">
          {roundToDecimals(row.getValue(turnoverKey))}
        </div>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      accessorFn: (row) => row.progress.current,
      enableSorting: true,
      size: 140,
      cell: ({ row }) => {
        const progress = row.original.progress as {
          current: number;
          required: number;
        };
        const percentage =
          Math.min((progress.current / progress.required) * 100, 100) || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 rounded-full h-2 flex-shrink-0">
              <div
                className={`h-2 rounded-full transition-all duration-200 ${getProgressColor(
                  progress.current,
                  progress.required
                )}`}
                style={{
                  width: `${percentage}%`,
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {roundToDecimals(progress.current, 2)}x/{roundToDecimals(progress.required, 2)}x
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: bonusClaimedKey,
      header: "Bonus Claimed",
      enableSorting: true,
      size: 100,
      cell: ({ row }) => (
        <div className="font-medium">
          {roundToDecimals(row.getValue(bonusClaimedKey))}
        </div>
      ),
    },
  ];
};

// Last activity column
const getLastActivityColumn = (): ColumnDef<Player> => ({
  accessorKey: "lastActivity",
  header: "Last Activity",
  enableSorting: true,
  size: 100,
  cell: ({ row }) => (
    <div>{toGMTString(row.getValue("lastActivity"), GMT_OFFSET)}</div>
  ),
});

// Claim Bonus column
const getClaimBonusColumn = (
  promotion: Promotion | undefined,
  promotionId: string,
  adminUserId: string
): ColumnDef<Player> => ({
  id: "claimBonus",
  header: "Action",
  enableSorting: false,
  size: 120,
  cell: ({ row }) => {
    const player = row.original;
    const playerStatus = player.status;
    const isExpired = player.progress.current >= player.progress.required && playerStatus === PROMOTION_STATUS.EXPIRED;
    
    // Check if promotion is completed
    const isPromotionCompleted = promotion
      ? getPromotionStatus(promotion) === PROMOTION_REPORT_STATUS.Completed
      : false;

    const canClaim = isExpired && isPromotionCompleted;

    const handleClaimBonus = async () => {
      if (!canClaim) {
        return;
      }

      if (!promotion?.operatorId) {
        alert("Error: Operator ID is missing from promotion data");
        return;
      }

      // Get currencyGroupId from player_promotion data
      const currencyGroup = player.currencyGroup;
      if (!currencyGroup) {
        alert("Error: Currency group ID is missing from player data");
        return;
      }

      // gameTypeId - using gameId from player_promotions data
      let gameTypeId = player.gameId;
      if (!gameTypeId) {
        // Show popup to input gameId
        const inputGameId = window.prompt(
          `Game ID is missing for player ${player.username}.\nPlease enter the Game ID to proceed with bonus claim:`,
          ""
        );
        
        if (!inputGameId) {
          alert("Game ID is required to claim bonus. Operation cancelled.");
          return;
        }

        // Validate that the input is a number
        const parsedGameId = parseInt(inputGameId.trim());
        if (isNaN(parsedGameId) || parsedGameId <= 0) {
          alert("Invalid Game ID. Please enter a valid positive number.");
          return;
        }

        gameTypeId = parsedGameId;
      }
      // siteId - not available in Player or Promotion
      // Note: This field needs to be provided or mapped from siteName
      const siteId = player.siteId;
      if (!siteId) {
        alert("Error: Site ID is missing. Please ensure siteId is available in player data.");
        return;
      }

      // Confirm before making request
      const confirmed = window.confirm(
        `Are you sure you want to claim bonus for player ${player.username}?`
      );

      if (!confirmed) {
        return;
      }

      try {
        const response = await fetch("/api/bonus-wins/manual-claim-bonus-wins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            promotionId,
            playerId: player.playerId,
            operatorId: promotion.operatorId,
            siteId,
            siteName: player.siteName,
            currency: player.currency,
            currencyGroup,
            gameTypeId,
            adminUserId,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to claim bonus");
        }

        alert("Bonus claimed successfully!");
        // Optionally refresh the data
        window.location.reload();
      } catch (error) {
        console.error("Error claiming bonus:", error);
        alert(error instanceof Error ? error.message : "Failed to claim bonus. Please try again.");
      }
    };

    if (!canClaim) {
      return <div className="text-gray-400 text-sm">-</div>;
    }

    return (
      <button
        onClick={handleClaimBonus}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors"
        title="Claim bonus for this player"
      >
        <Gift className="w-3 h-3" />
        Claim Bonus
      </button>
    );
  },
});


export default function PlayersTable({
  data,
  isBaseCurrency,
  onCurrencyToggle,
  metaDataTotalAmount,
  pageCount,
  totalCount,
  pagination,
  onPaginationChange,
  isLoading = false,
  onExportPlayers,
  promotion,
}: PlayersTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "dateJoined",
      desc: true,
    },
  ]);
  // Get promotion ID from promotion data
  const promotionId = promotion?._id || '';
  
  // Get admin user ID (username) from logged in user
  const adminUserId = user?.Username || '';

  const columns = useMemo<ColumnDef<Player>[]>(() => {
    return [
      ...getBasicPlayerColumns(router, isBaseCurrency),
      ...getBonusColumns(isBaseCurrency),
      getLastActivityColumn(),
      getClaimBonusColumn(promotion, promotionId, adminUserId),
    ];
  }, [isBaseCurrency, router, promotion, promotionId, adminUserId]);

  const table = useReactTable({
    data: data || [],
    columns,
    sortingFns: {
      fuzzy: fuzzySort,
    },
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pageCount,
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Promotional Players
          </h2>
        </div>
         <button 
           onClick={onExportPlayers}
           className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
         >
           <Download className="w-4 h-4" />
           Export
         </button>
      </div>

      <PaginationControls
        pagination={pagination}
        totalCount={totalCount || 0}
        onPaginationChange={onPaginationChange}
        table={table}
        showCurrencyToggle={true}
        isBaseCurrency={isBaseCurrency}
        onCurrencyToggle={onCurrencyToggle}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[1200px]">
            <TableHeader table={table} />
            <TableBody
              table={table}
              columns={columns}
              isLoading={isLoading}
              loadingText="Loading players..."
              emptyText="No results."
            />
            {/* Total Row */}
            {!isLoading && table.getRowModel().rows?.length > 0 && (
              <tfoot className="bg-gray-50 border-t-1 border-gray-300">
                <tr>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                    Total
                    <span className="text-xs text-gray-500 block">
                      {" "}
                      (Base USD)
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    {roundToDecimals(metaDataTotalAmount.baseTotalWinAmount)}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    {roundToDecimals(metaDataTotalAmount.baseTotalTurnover)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    {roundToDecimals(
                      metaDataTotalAmount.baseTotalBonusClaimed
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                  <td className="px-6 py-3 text-sm text-gray-500">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
