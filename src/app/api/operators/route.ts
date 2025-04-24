import { NextResponse } from "next/server";
import { getAccessToken } from "../token/route";
import axios from "axios";
import config from "../../../config";

export async function GET() {
  try {
    const token = await getAccessToken();
  
    const res = await axios.get(`${config.apiBaseUrl}/partner`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    console.error("Error fetching operators:", error);
    return NextResponse.json(
      { error: "Failed to fetch operators" },
      { status: 500 }
    );
  }
}
