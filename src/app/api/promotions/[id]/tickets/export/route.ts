import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import ExcelJS from 'exceljs';
import configs from '../../../../../../../configs';
import { roundToDecimals } from '@/lib/promotion/promotion.utils';
import { convertToGMTDate } from '@/lib/date-time.utils';
import { GMT_OFFSET } from '@/constants/constants';
import { PromotionalTicket } from '@/types/promotional-tickets';
import { createGameDisplayNameMap, mapWithDisplayNames } from '@/lib/promotion/gameDisplayName.utils';
import { appendIf, pipe } from '@/lib/functional.utils';
import { sanitizeForExcel } from '@/lib/excel.utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promotionId } = await params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const roundId = searchParams.get('roundId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isBaseCurrency = searchParams.get('isBaseCurrency') === 'true';
    const gameType = searchParams.get('gameType');
    const currencyGroups = searchParams.get('currencyGroups');
    const playerPromotionId = searchParams.get('playerPromotionId');

    if (!promotionId || !playerId) {
      return NextResponse.json(
        { error: 'promotionId and playerId are required' },
        { status: 400 }
      );
    }

    const urlParams = pipe<URLSearchParams>(
      (p) => { p.append('promotionId', promotionId); return p; },
      appendIf(playerId, (v) => !!v, "playerId", String),
      appendIf(roundId, (v) => !!v, "roundId", String),
      appendIf(startDate, (v) => !!v, "startDate", String),
      appendIf(endDate, (v) => !!v, "endDate", String),
      appendIf(playerPromotionId, (v) => !!v, "playerPromotionId", String)
    )(new URLSearchParams());
    const apiUrl = `${configs.apiPromotionUrl}/promotion-tickets/export-promotion-tickets?${urlParams.toString()}`;

    // Create game display name map using utility function
    const gameDisplayNameMap = await createGameDisplayNameMap(gameType, currencyGroups);

    // Call external API to get all tickets for export
    const response = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
    });

    // Create Excel workbook
    const tickets = response.data.tickets || [];
    
    // Map tickets to include proper display names using utility function
    const mappedTickets = mapWithDisplayNames(tickets, gameDisplayNameMap);

    const currencySuffix = isBaseCurrency ? ' (USD)' : '';
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tickets');

    // Define columns with headers
    worksheet.columns = [
      { header: 'Date Time (GMT+7)', key: 'dateTime', width: 22 },
      { header: 'Round ID', key: 'roundId', width: 35 },
      { header: 'Game ID / Name', key: 'gameName', width: 40 },
      { header: `Bet Amount${currencySuffix}`, key: 'betAmount', width: 18 },
      { header: `Win Amount${currencySuffix}`, key: 'winAmount', width: 18 },
      { header: 'Site Name', key: 'siteName', width: 20 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    mappedTickets.forEach((ticket: PromotionalTicket) => {
      const dateTime = convertToGMTDate(ticket.createdAt, GMT_OFFSET);
      
      const row = worksheet.addRow({
        dateTime: dateTime || '',
        roundId: sanitizeForExcel(ticket.gameRoundId || ''),
        gameName: sanitizeForExcel(`${ticket.gameId || ''} / ${ticket.displayName || ''}`),
        betAmount: roundToDecimals(isBaseCurrency ? ticket.baseBetAmount : ticket.betAmount) || 0,
        winAmount: roundToDecimals(isBaseCurrency ? ticket.baseWinAmount : ticket.winAmount) || 0,
        siteName: sanitizeForExcel(ticket.siteName || '')
      });

      // Set date format for date column (only if date exists)
      if (dateTime) {
        row.getCell('dateTime').numFmt = 'dd-mmm-yyyy hh:mm:ss';
      }
      
      // Set number format for numeric columns
      row.getCell('betAmount').numFmt = '#,##0.00';
      row.getCell('winAmount').numFmt = '#,##0.00';
    });

    // Calculate totals
    const totalBetAmount = mappedTickets.reduce((sum: number, ticket: PromotionalTicket) => sum + (isBaseCurrency ? ticket.baseBetAmount : ticket.betAmount), 0);
    const totalWinAmount = mappedTickets.reduce((sum: number, ticket: PromotionalTicket) => sum + (isBaseCurrency ? ticket.baseWinAmount : ticket.winAmount), 0);

    // Add total row
    const totalRow = worksheet.addRow({
      dateTime: `Total ${currencySuffix}`,
      roundId: '-',
      gameName: '-',
      betAmount: roundToDecimals(totalBetAmount),
      winAmount: roundToDecimals(totalWinAmount),
      siteName: '-'
    });

    // Style total row
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD700' }
    };
    totalRow.getCell('betAmount').numFmt = '#,##0.00';
    totalRow.getCell('winAmount').numFmt = '#,##0.00';

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return XLSX file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="promotional-tickets-${playerId}-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error exporting promotional tickets:', error);
    return NextResponse.json(
      { error: 'Failed to export promotional tickets' },
      { status: 500 }
    );
  }
}
