import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    const available = !existingUser;
    return NextResponse.json({
      available,
      message: available
        ? "Username is available"
        : "Username is already taken",
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Failed to check username" },
      { status: 500 }
    );
  }
}
