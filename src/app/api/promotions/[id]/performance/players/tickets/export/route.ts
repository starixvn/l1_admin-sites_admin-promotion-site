import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import configs from '../../../../../../../../../configs';
import { roundToDecimals } from '@/lib/promotion/promotion.utils';
import { toGMTStringWithSeconds } from '@/lib/date-time.utils';
import { GMT_OFFSET } from '@/constants/constants';
import { PromotionalTicket } from '@/types/promotional-tickets';
import { createGameDisplayNameMap, mapWithDisplayNames } from '@/lib/promotion/gameDisplayName.utils';

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

    // Create game display name map using utility function
    const gameDisplayNameMap = await createGameDisplayNameMap(gameType, currencyGroups);

    // Build query parameters for external API
    const queryParams = {
      promotionId,
      playerId,
      roundId,
      startDate,
      endDate,
      playerPromotionId,
    };

    // Call external API to get all tickets for export
    const response = await axios.get(`${configs.apiPromotionUrl}/promotion-tickets/export-promotion-tickets`, {
      params: queryParams,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    // Convert data to CSV format
    const tickets = response.data.tickets || [];
    
    // Map tickets to include proper display names using utility function
    const mappedTickets = mapWithDisplayNames(tickets, gameDisplayNameMap);

    const currencySuffix = isBaseCurrency ? ' (USD)' : '';
    const csvHeaders = [
      'Date Time (GMT+7)',
      'Round ID',
      'Game ID / Name',
      `Bet Amount${currencySuffix}`,
      `Win Amount${currencySuffix}`,
      'Site Name',
    ];

    const csvRows = mappedTickets.map((ticket: PromotionalTicket) => [
      toGMTStringWithSeconds(ticket.createdAt, GMT_OFFSET) || '',
      ticket.gameRoundId || '',
      `${ticket.gameId || ''} / ${ticket.displayName || ''}`,
      roundToDecimals(isBaseCurrency ? ticket.baseBetAmount : ticket.betAmount) || 0,
      roundToDecimals(isBaseCurrency ? ticket.baseWinAmount : ticket.winAmount) || 0,
      ticket.siteName || '',
    ]);

    // Calculate totals
    const totalBetAmount = mappedTickets.reduce((sum: number, ticket: PromotionalTicket) => sum + (isBaseCurrency ? ticket.baseBetAmount : ticket.betAmount), 0);
    const totalWinAmount = mappedTickets.reduce((sum: number, ticket: PromotionalTicket) => sum + (isBaseCurrency ? ticket.baseWinAmount : ticket.winAmount), 0);

    // Create total row
    const totalRow = [
      `Total ${currencySuffix}`,
      '-',
      '-',
      roundToDecimals(totalBetAmount),
      roundToDecimals(totalWinAmount),
      '-'
    ];

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: (string | number)[]) => row.map((field: string | number) => `"${field}"`).join(',')),
      totalRow.map((field: string | number) => `"${field}"`).join(',')
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="promotional-tickets-${playerId}-${new Date().toISOString().split('T')[0]}.csv"`
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
