import { SortingFn } from "@tanstack/react-table";
import { RankingInfo, compareItems } from "@tanstack/match-sorter-utils";

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  // Only sort by rank if the column has ranking data
  const aRank = rowA.columnFiltersMeta[columnId] as RankingInfo;
  const bRank = rowB.columnFiltersMeta[columnId] as RankingInfo;

  if (aRank && bRank) {
    return compareItems(aRank, bRank);
  }

  return 0;
};
