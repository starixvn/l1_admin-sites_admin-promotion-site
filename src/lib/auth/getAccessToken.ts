import qs from "qs";
import axios, { AxiosError } from "axios";
import configs from "../../../configs";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  error?: string;
  error_description?: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // Check if we have a cached token and it's still valid (with 5 minute buffer)
  if (cachedToken && now < tokenExpiresAt - 300_000) {
    return cachedToken;
  }

  // Clear expired token
  if (cachedToken && now >= tokenExpiresAt) {
    cachedToken = null;
    tokenExpiresAt = 0;
  }

  try {
    const rawBody = qs.stringify({
      grant_type: "client_credentials",
      client_id: configs.clientId,
      client_secret: configs.clientSecret,
      scope: configs.scope,
    });

    const response = await axios.post<TokenResponse>(
      configs.identityUrl,
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

    // Update cached token and expiration time
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
    
    // Clear cached token on error
    cachedToken = null;
    tokenExpiresAt = 0;
    
    throw new Error("Failed to fetch access token");
  }
}

// Function to manually clear cached token (useful for testing or force refresh)
export function clearCachedToken(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

// Function to check if token is expired
export function isTokenExpired(): boolean {
  return !cachedToken || Date.now() >= tokenExpiresAt;
}

// Debug function to get token status
export function getTokenStatus(): {
  hasToken: boolean;
  expiresAt: string | null;
  isExpired: boolean;
  timeUntilExpiry: number | null;
} {
  if (!cachedToken) {
    return {
      hasToken: false,
      expiresAt: null,
      isExpired: true,
      timeUntilExpiry: null,
    };
  }

  const now = Date.now();
  const timeUntilExpiry = tokenExpiresAt - now;
  
  return {
    hasToken: true,
    expiresAt: new Date(tokenExpiresAt).toISOString(),
    isExpired: now >= tokenExpiresAt,
    timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : null,
  };
}
