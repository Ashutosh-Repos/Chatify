import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { profilePic } = await request.json();

    if (!profilePic) {
      return NextResponse.json(
        { error: "Profile picture is required" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "chatify/profiles",
    });

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { profilePic: uploadResponse.secure_url },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePic: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
