import { NextResponse } from "next/server";
import { getAccessToken } from "../../token/route";
import axios from "axios";
import config from "@/config";

type Params = {
  params: {
    partnerId: string;
  };
};

export async function GET(request: Request, { params }: Params) {
  const { partnerId } = params;

  try {
    const token = await getAccessToken();

    const res = await axios.get(
      `${config.apiBaseUrl}/currency_group/partner/${partnerId}`, // GỌI API có path param
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (error) {
    console.error("Error fetching currency groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch currency groups" },
      { status: 500 }
    );
  }
}
