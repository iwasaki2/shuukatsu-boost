import Stripe from "stripe";
import { prisma } from "@/lib/db";
import type { PlanId } from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return Response.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId } = session.metadata ?? {};
        if (!userId || !planId) break;

        await prisma.userPlan.upsert({
          where: { userId },
          update: {
            planId: planId as PlanId,
            stripeSubscriptionId: session.subscription as string | null,
            status: "active",
          },
          create: {
            userId,
            planId: planId as PlanId,
            stripeSubscriptionId: session.subscription as string | null,
            status: "active",
          },
        });

        if (session.customer) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: session.customer as string },
          });
        }

        console.log(`Plan activated: user=${userId} plan=${planId}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (!user) break;

        const priceId = sub.items.data[0]?.price.id;
        const growthPriceId = process.env.STRIPE_GROWTH_PRICE_ID;
        const execPriceId = process.env.STRIPE_EXECUTIVE_PRICE_ID;

        let planId: PlanId = "starter";
        if (priceId === growthPriceId) planId = "growth";
        if (priceId === execPriceId) planId = "executive";

        await prisma.userPlan.upsert({
          where: { userId: user.id },
          update: {
            planId,
            stripeSubscriptionId: sub.id,
            status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "active",
            currentPeriodEnd: new Date((sub.items.data[0] as unknown as { current_period_end: number })?.current_period_end * 1000),
          },
          create: {
            userId: user.id,
            planId,
            stripeSubscriptionId: sub.id,
            status: "active",
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (!user) break;

        await prisma.userPlan.upsert({
          where: { userId: user.id },
          update: { planId: "starter", stripeSubscriptionId: null, status: "canceled" },
          create: { userId: user.id, planId: "starter", status: "canceled" },
        });

        console.log(`Subscription canceled: user=${user.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (!user) break;

        await prisma.userPlan.update({
          where: { userId: user.id },
          data: { status: "past_due" },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
