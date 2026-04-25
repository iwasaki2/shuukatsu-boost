import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return Response.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // checkout.session.completed → プラン有効化
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, planId } = session.metadata ?? {};
    if (userId && planId) {
      // 本番では DB に保存する。ここでは webhook 確認のみ。
      console.log(`Plan activated: user=${userId} plan=${planId}`);
    }
  }

  // subscription.deleted → Starter にダウングレード
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    console.log(`Subscription canceled: ${sub.id}`);
  }

  return Response.json({ received: true });
}
