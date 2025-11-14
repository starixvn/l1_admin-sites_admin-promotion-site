import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import configs from '../../../../../../../configs';
import { roundToDecimals } from '@/lib/promotion/promotion.utils';
import { toGMTString } from '@/lib/date-time.utils';
import { GMT_OFFSET } from '@/constants/constants';
import { Player } from '@/types/performance-report';
import { createGameDisplayNameMap, mapWithDisplayNames } from '@/lib/promotion/gameDisplayName.utils';
import { pipe, appendIf } from '@/lib/functional.utils';

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

    // Convert data to CSV format
    const players = response.data.items || [];
    
    const currencySuffix = isBaseCurrency ? ' (USD)' : '';
    const csvHeaders = [
      'Player ID',
      'Username',
      'Status',
      'Site Name',
      'Game Name',
      'Currency',
      'Date Joined (GMT+7)',
      'Remaining FS',
      `Bonus Win${currencySuffix}`,
      `Turnover${currencySuffix}`,
      'Progress',
      `Bonus Claimed${currencySuffix}`,
      'Last Activity (GMT+7)'
    ];

    const csvRows = players.map((player: Player & { displayName: string }) => [
      player.playerId || '',
      player.username || '',
      player.status || '',
      player.siteName || '',
      player.displayName || '',
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
      '-',
      '-',
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
