import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import ExcelJS from 'exceljs';
import configs from '../../../../../../../configs';
import { roundToDecimals } from '@/lib/promotion/promotion.utils';
import { GMT_OFFSET } from '@/constants/constants';
import { Player } from '@/types/performance-report';
import { createGameDisplayNameMap, mapWithDisplayNames } from '@/lib/promotion/gameDisplayName.utils';
import { pipe, appendIf } from '@/lib/functional.utils';
import { convertToGMTDate } from '@/lib/date-time.utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promotionId } = await params;
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');
    const currencyGroups = searchParams.get('currencyGroups');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const player = searchParams.get('player');
    const currencies = searchParams.get('currencies');
    const isBaseCurrency = searchParams.get('isBaseCurrency') === 'true';
    const gameIds = searchParams.get('gameIds');
    if (!promotionId) {
      return NextResponse.json(
        { error: 'promotionId is required' },
        { status: 400 }
      );
    }

    // Build query parameters for external API
    const urlParams = pipe<URLSearchParams>(
      (p) => { p.append('promotionId', promotionId); return p; },
      appendIf(startDate, (v) => !!v, "startDate", String),
      appendIf(endDate, (v) => !!v, "endDate", String),
      appendIf(status, (v) => !!v && v !== 'All Status', "status", String),
      appendIf(player, (v) => !!v && v.length > 0 && v.trim() !== '', "player", (v) => encodeURIComponent((v as string).trim())),
      appendIf(currencies, (v) => !!v && v.length > 0, "currencies", String),
      appendIf(gameIds, (v) => !!v && v.length > 0, "gameIds", String)
    )(new URLSearchParams());

    // Call external API to get all players for export
    const apiUrl = `${configs.apiPromotionUrl}/player-promotions/state/export?${urlParams.toString()}`;
    const response = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const gameDisplayNameMap = await createGameDisplayNameMap(gameType, currencyGroups);

    if (response.data?.items) {
      response.data.items = mapWithDisplayNames(response.data.items, gameDisplayNameMap);
    }

    // Create Excel workbook
    const players = response.data.items || [];
    
    const currencySuffix = isBaseCurrency ? ' (USD)' : '';
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Players');

    // Define columns with headers
    worksheet.columns = [
      { header: 'Player ID', key: 'playerId', width: 15 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Site Name', key: 'siteName', width: 20 },
      { header: 'Game Name', key: 'gameName', width: 30 },
      { header: 'Currency', key: 'currency', width: 12 },
      { header: 'Date Joined (GMT+7)', key: 'dateJoined', width: 22 },
      { header: 'Remaining FS', key: 'remainingFS', width: 15 },
      { header: `Bonus Win${currencySuffix}`, key: 'bonusWin', width: 18 },
      { header: `Turnover${currencySuffix}`, key: 'turnover', width: 18 },
      { header: 'Progress', key: 'progress', width: 15 },
      { header: `Bonus Claimed${currencySuffix}`, key: 'bonusClaimed', width: 18 },
      { header: 'Last Activity (GMT+7)', key: 'lastActivity', width: 22 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    players.forEach((player: Player & { displayName: string }) => {
      const row = worksheet.addRow({
        playerId: player.playerId || '',
        username: player.username || '',
        status: player.status || '',
        siteName: player.siteName || '',
        gameName: player.displayName || '',
        currency: player.currency || '',
        dateJoined: convertToGMTDate(player.dateJoined, GMT_OFFSET) || '',
        remainingFS: `\t${player.remainingBonusItems || 0}/${player.initialBonusItem || 0}`,
        bonusWin: roundToDecimals(isBaseCurrency ? player.baseBonusWin : player.bonusWin) || 0,
        turnover: roundToDecimals(isBaseCurrency ? player.baseTurnover : player.turnover) || 0,
        progress: `${roundToDecimals(player.progress?.current || 0)}x/${player.progress?.required || 0}x`,
        bonusClaimed: roundToDecimals(isBaseCurrency ? player.baseBonusClaimed : player.bonusClaimed) || 0,
        lastActivity: convertToGMTDate(player.lastActivity, GMT_OFFSET) || ''
      });

      // Set custom date format for date columns
      row.getCell('dateJoined').numFmt = 'dd-mmm-yyyy hh:mm:ss';
      row.getCell('lastActivity').numFmt = 'dd-mmm-yyyy hh:mm:ss';
      
      // Set number format for numeric columns
      row.getCell('bonusWin').numFmt = '#,##0.00';
      row.getCell('turnover').numFmt = '#,##0.00';
      row.getCell('bonusClaimed').numFmt = '#,##0.00';
    });

    // Calculate totals
    const totalBonusWin = players.reduce((sum: number, player: Player) => sum + player.baseBonusWin, 0);
    const totalTurnover = players.reduce((sum: number, player: Player) => sum + player.baseTurnover, 0);
    const totalBonusClaimed = players.reduce((sum: number, player: Player) => sum + player.baseBonusClaimed, 0);

    // Add total row
    const totalRow = worksheet.addRow({
      playerId: 'Total (Base USD)',
      username: '-',
      status: '-',
      siteName: '-',
      gameName: '-',
      currency: '-',
      dateJoined: '-',
      remainingFS: '-',
      bonusWin: roundToDecimals(totalBonusWin),
      turnover: roundToDecimals(totalTurnover),
      progress: '-',
      bonusClaimed: roundToDecimals(totalBonusClaimed),
      lastActivity: '-'
    });

    // Style total row
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD700' }
    };
    totalRow.getCell('bonusWin').numFmt = '#,##0.00';
    totalRow.getCell('turnover').numFmt = '#,##0.00';
    totalRow.getCell('bonusClaimed').numFmt = '#,##0.00';

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return XLSX file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="promotional-players-${promotionId}-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error exporting promotional players:', error);
    return NextResponse.json(
      { error: 'Failed to export promotional players' },
      { status: 500 }
    );
  }
}
