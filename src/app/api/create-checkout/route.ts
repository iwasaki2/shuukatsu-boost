import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(request: Request) {
  try {
    const { planId, userId, userEmail } = await request.json();

    const priceId =
      planId === "growth"
        ? process.env.STRIPE_GROWTH_PRICE_ID
        : planId === "executive"
        ? process.env.STRIPE_EXECUTIVE_PRICE_ID
        : null;

    if (!priceId) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      metadata: { userId, planId },
      success_url: `${baseUrl}/billing?success=1&plan=${planId}`,
      cancel_url: `${baseUrl}/billing?canceled=1`,
      locale: "ja",
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: "チェックアウトの作成に失敗しました" }, { status: 500 });
  }
}
