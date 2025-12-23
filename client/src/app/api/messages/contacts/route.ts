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

    const contacts = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
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
      take: 100, // Limit for scalability
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error getting contacts:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
