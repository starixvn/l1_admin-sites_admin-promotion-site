import qs from "qs";
import axios, { AxiosError } from "axios";
import config from "../../../config";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  error?: string;
  error_description?: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  // Return cached token if still valid (with 1 min buffer)
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  try {
    const rawBody = qs.stringify({
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: config.scope,
    });
    console.log("identityUrl: ", config.identityUrl);

    const response = await axios.post<TokenResponse>(
      config.identityUrl,
      rawBody,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { data } = response;

    if (data.error) {
      throw new Error(data.error_description || "Failed to fetch access token");
    }

    cachedToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000;

    return cachedToken;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Failed to fetch access token:", {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: axiosError.message,
    });
    throw new Error("Failed to fetch access token");
  }
}
