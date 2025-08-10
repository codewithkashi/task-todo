import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");
    if (!countryId) {
      return NextResponse.json(
        { error: "Country ID is required" },
        { status: 400 }
      );
    }
    const cities = await prisma.city.findMany({
      where: {
        countryId: countryId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
