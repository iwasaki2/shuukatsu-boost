import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planId } = await request.json();

    const priceId =
      planId === "growth"
        ? process.env.STRIPE_GROWTH_PRICE_ID
        : planId === "executive"
        ? process.env.STRIPE_EXECUTIVE_PRICE_ID
        : null;

    if (!priceId) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: user.id, planId },
      success_url: `${baseUrl}/billing?success=1&plan=${planId}`,
      cancel_url: `${baseUrl}/billing?canceled=1`,
      locale: "ja",
    };

    if (user.stripeCustomerId) {
      checkoutParams.customer = user.stripeCustomerId;
    } else {
      checkoutParams.customer_email = user.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);
    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: "チェックアウトの作成に失敗しました" }, { status: 500 });
  }
}
