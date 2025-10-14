import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import configs from '../../../../../../../../configs';
import { roundToDecimals } from '@/lib/promotion/promotion.utils';
import { toGMTString } from '@/lib/date-time.utils';
import { GMT_OFFSET } from '@/constants/constants';
import { Player } from '@/types/performance-report';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promotionId } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const player = searchParams.get('player');
    const currencies = searchParams.get('currencies');
    const isBaseCurrency = searchParams.get('isBaseCurrency') === 'true';
    if (!promotionId) {
      return NextResponse.json(
        { error: 'promotionId is required' },
        { status: 400 }
      );
    }

    // Build query parameters for external API
    const queryParams: any = {
      promotionId,
    };

    if (startDate) {
      queryParams.startDate = startDate;
    }
    if (endDate) {
      queryParams.endDate = endDate;
    }
    if (status && status !== 'All Status') {
      queryParams.status = status;
    }
    if (player && player.length > 0 && player.trim() !== '') {
      queryParams.player = player.trim();
    }
    if (currencies && currencies.length > 0) {
      queryParams.currencies = currencies;
    }

    // Call external API to get all players for export
    const response = await axios.get(`${configs.apiPromotionUrl}/player-promotions/state/export`, {
      params: queryParams,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    // Convert data to CSV format
    const players = response.data.items || [];
    
    const currencySuffix = isBaseCurrency ? ' (USD)' : '';
    const csvHeaders = [
      'Player ID',
      'Username',
      'Status',
      'Site Name',
      'Currency',
      'Date Joined (GMT+7)',
      'Remaining FS',
      `Bonus Win${currencySuffix}`,
      `Turnover${currencySuffix}`,
      'Progress',
      `Bonus Claimed${currencySuffix}`,
      'Last Activity (GMT+7)'
    ];

    const csvRows = players.map((player: Player) => [
      player.id || '',
      player.username || '',
      player.status || '',
      player.siteName || '',
      player.currency || '',
      toGMTString(player.dateJoined, GMT_OFFSET) || '',
      `${player.remainingBonusItems || 0}/${player.initialBonusItem || 0}`,
      roundToDecimals(isBaseCurrency ? player.baseBonusWin : player.bonusWin) || 0,
      roundToDecimals(isBaseCurrency ? player.baseTurnover : player.turnover) || 0,
      `${player.progress?.current || 0}x/${player.progress?.required || 0}x`,
      roundToDecimals(isBaseCurrency ? player.baseBonusClaimed : player.bonusClaimed) || 0,
      toGMTString(player.lastActivity, GMT_OFFSET) || ''
    ]);

    // Calculate totals
    const totalBonusWin = players.reduce((sum: number, player: Player) => sum + player.baseBonusWin, 0);
    const totalTurnover = players.reduce((sum: number, player: Player) => sum + player.baseTurnover, 0);
    const totalBonusClaimed = players.reduce((sum: number, player: Player) => sum + player.baseBonusClaimed, 0);

    // Create total row
    const totalRow = [
      'Total (Base USD)',
      '-',
      '-',
      '-',
      '-',
      '--',
      '',
      roundToDecimals(totalBonusWin),
      roundToDecimals(totalTurnover),
      '-',
      roundToDecimals(totalBonusClaimed),
      '-'
    ];

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: string[]) => row.map((field: string) => `"${field}"`).join(',')),
      totalRow.map((field: string | number) => `"${field}"`).join(',')
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="promotional-players-${promotionId}-${new Date().toISOString().split('T')[0]}.csv"`
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
