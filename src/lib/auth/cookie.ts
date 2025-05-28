import { cookies } from "next/headers";

export async function getUserFromCookie(): Promise<any | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  if (!userCookie) return null;

  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}
