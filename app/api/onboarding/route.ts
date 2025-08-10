import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FormValues } from "@/types/onboarding";
export async function POST(request: Request) {
  try {
    console.log("API route hit for /api/onboarding");
    const body: FormValues = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    if (
      !body.email ||
      !body.username ||
      !body.password ||
      !body.firstName ||
      !body.lastName ||
      !body.dateOfBirth ||
      !body.accountType ||
      !body.confirmPassword
    ) {
      console.log("Missing required fields:", {
        email: !!body.email,
        username: !!body.username,
        password: !!body.password,
        firstName: !!body.firstName,
        lastName: !!body.lastName,
        dateOfBirth: !!body.dateOfBirth,
        accountType: !!body.accountType,
        confirmPassword: !!body.confirmPassword,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (body.password !== body.confirmPassword) {
      console.log("Password mismatch:", {
        password: body.password ? "provided" : "missing",
        confirmPassword: body.confirmPassword ? "provided" : "missing",
      });
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        accountType: body.accountType.toUpperCase() as "SELLER" | "BUYER",
        businessName: body.businessName || null,
        registrationNumber: body.registrationNumber || null,
        country: body.country || null,
        city: body.city || null,
        area: body.area || null,
        tradeLicenseUrl: body.tradeLicense ? "uploaded" : null,
        monthlySpendingLimit: body.monthlySpendingLimit || null,
        promotionalOffers: body.promotionalOffers || false,
      },
    });
    if (
      body.accountType === "seller" &&
      body.products &&
      body.products.length > 0
    ) {
      const productsData = body.products.map((product) => ({
        name: product.name,
        category: product.category,
        price: product.price,
        stockQuantity: product.stockQuantity,
        userId: user.id,
      }));
      await prisma.product.createMany({
        data: productsData,
      });
    }
    if (
      body.accountType === "buyer" &&
      body.interests &&
      body.interests.length > 0
    ) {
      const interestsData = body.interests.map((interest) => ({
        name: interest,
        userId: user.id,
      }));
      await prisma.interest.createMany({
        data: interestsData,
      });
    }
    if (body.verificationDocuments && body.verificationDocuments.length > 0) {
      const documentsData = body.verificationDocuments.map((doc, index) => ({
        fileName: doc.name || `document_${index + 1}`,
        fileUrl: "uploaded",
        fileType: doc.type || "application/octet-stream",
        userId: user.id,
      }));
      await prisma.verificationDocument.createMany({
        data: documentsData,
      });
    }
    console.log("User created successfully with ID:", user.id);
    return NextResponse.json({
      success: true,
      userId: user.id,
      message: "Onboarding completed successfully!",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
