import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ profile: null });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, university, faculty, background, gakuchika, strengths, weaknesses, jobAxis } = body;

  const profile = await prisma.profile.upsert({
    where: { userId: session.userId },
    update: {
      displayName: name ?? "",
      university: university ?? "",
      faculty: faculty ?? "",
      background: background ?? "",
      gakuchika: gakuchika ?? "",
      strengths: strengths ?? "",
      weaknesses: weaknesses ?? "",
      jobAxis: jobAxis ?? "",
    },
    create: {
      userId: session.userId,
      displayName: name ?? "",
      university: university ?? "",
      faculty: faculty ?? "",
      background: background ?? "",
      gakuchika: gakuchika ?? "",
      strengths: strengths ?? "",
      weaknesses: weaknesses ?? "",
      jobAxis: jobAxis ?? "",
    },
  });

  return NextResponse.json({ profile });
}
