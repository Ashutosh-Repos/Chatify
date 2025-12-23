import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId: otherUserId } = await params;
    const myId = session.user.id;

    // Get messages between the two users with pagination
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const cursor = url.searchParams.get("cursor");

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
