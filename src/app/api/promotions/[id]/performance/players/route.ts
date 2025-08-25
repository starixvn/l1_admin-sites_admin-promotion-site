import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Mock data cho players
    const mockPlayersData = {
      players: [
        {
          id: "JohnDoe123",
          username: "JohnDoe123",
          status: "Active",
          dateJoined: "2024-01-15",
          bonusReceived: 125.50,
          turnoverContributed: 890.25,
          progress: { current: 1.5, required: 2.0 },
          bonusRedeemed: 0.00,
          lastActivity: "2024-01-25"
        },
        {
          id: "AlicePlayer456",
          username: "AlicePlayer456", 
          status: "Turnover Met",
          dateJoined: "2024-01-16",
          bonusReceived: 200.00,
          turnoverContributed: 1250.75,
          progress: { current: 2.0, required: 2.0 },
          bonusRedeemed: 0.00,
          lastActivity: "2024-01-24"
        },
        {
          id: "BobGamer789",
          username: "BobGamer789",
          status: "Bonus Redeemed",
          dateJoined: "2024-01-14",
          bonusReceived: 150.00,
          turnoverContributed: 950.30,
          progress: { current: 3.0, required: 3.0 },
          bonusRedeemed: 150.00,
          lastActivity: "2024-01-23"
        },
        {
          id: "CarolWins101",
          username: "CarolWins101",
          status: "Active",
          dateJoined: "2024-01-17",
          bonusReceived: 75.00,
          turnoverContributed: 340.80,
          progress: { current: 0.9, required: 2.0 },
          bonusRedeemed: 0.00,
          lastActivity: "2024-01-25"
        },
        {
          id: "DaveSlots222",
          username: "DaveSlots222",
          status: "Ineligible",
          dateJoined: "2024-01-18",
          bonusReceived: 100.00,
          turnoverContributed: 45.20,
          progress: { current: 0.3, required: 2.0 },
          bonusRedeemed: 0.00,
          lastActivity: "2024-01-20"
        },
        {
          id: "EveLucky333",
          username: "EveLucky333",
          status: "Active",
          dateJoined: "2024-01-19",
          bonusReceived: 175.25,
          turnoverContributed: 725.60,
          progress: { current: 1.2, required: 2.0 },
          bonusRedeemed: 0.00,
          lastActivity: "2024-01-24"
        },
        {
          id: "FrankCasino444",
          username: "FrankCasino444",
          status: "Opted Out",
          dateJoined: "2024-01-20",
          bonusReceived: 50.00,
          turnoverContributed: 0.00,
          progress: { current: 0.0, required: 2.0 },
          bonusRedeemed: 0.00,
          lastActivity: "2024-01-20"
        },
        {
          id: "GraceSpins555",
          username: "GraceSpins555",
          status: "Bonus Redeemed",
          dateJoined: "2024-01-21",
          bonusReceived: 225.00,
          turnoverContributed: 1350.00,
          progress: { current: 2.5, required: 2.5 },
          bonusRedeemed: 225.00,
          lastActivity: "2024-01-22"
        }
      ]
    };

    return NextResponse.json(mockPlayersData);
  } catch (error) {
    console.error("Error fetching players data:", error);
    return NextResponse.json(
      { error: "Failed to fetch players data" },
      { status: 500 }
    );
  }
}
