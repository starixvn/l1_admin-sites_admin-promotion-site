import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import config from '@/config';
import { getAccessToken } from '@/app/api/token/route';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const token = await getAccessToken();

    const response = await axios.get(`${config.apiPromotionUrl}/promotions`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        operatorIds: params.getAll('operatorIds'),
        status: params.get('status'),
        code: params.get('code'),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = await getAccessToken();

    const response = await axios.post(`${config.apiPromotionUrl}/promotions`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}