import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { PlanId } from "@/lib/plans";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ planId: "starter" as PlanId });
  }

  const userPlan = await prisma.userPlan.findUnique({
    where: { userId: session.userId },
  });

  const planId = (userPlan?.planId ?? "starter") as PlanId;
  const isActive = !userPlan || userPlan.status === "active";

  return NextResponse.json({
    planId: isActive ? planId : ("starter" as PlanId),
    status: userPlan?.status ?? "active",
    currentPeriodEnd: userPlan?.currentPeriodEnd ?? null,
  });
}
