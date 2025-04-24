import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import config from "@/config";
import { getAccessToken } from "../../token/route"; // đường dẫn tới token route của bạn

export async function GET(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  const { partnerId } = params;

  try {
    const token = await getAccessToken();

    const response = await axios.get(
      `${config.apiBaseUrl}/currency_group/partner/${partnerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching currency groups by partner:", error);
    return NextResponse.json(
      { error: "Failed to fetch currency groups" },
      { status: 500 }
    );
  }
}
