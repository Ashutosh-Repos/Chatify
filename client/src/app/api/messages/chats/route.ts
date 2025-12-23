import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all users who have exchanged messages with the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
      distinct: ["senderId", "receiverId"],
    });

    // Get unique user IDs from conversations
    const userIds = new Set<string>();
    messages.forEach((msg) => {
      if (msg.senderId !== userId) userIds.add(msg.senderId);
      if (msg.receiverId !== userId) userIds.add(msg.receiverId);
    });

    if (userIds.size === 0) {
      return NextResponse.json([]);
    }

    // Fetch user details
    const chatPartners = await prisma.user.findMany({
      where: {
        id: { in: Array.from(userIds) },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePic: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    return NextResponse.json(chatPartners);
  } catch (error) {
    console.error("Error getting chats:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
