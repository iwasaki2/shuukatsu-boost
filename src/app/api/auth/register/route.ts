import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上にしてください" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    await prisma.userPlan.create({
      data: { userId: user.id, planId: "starter" },
    });

    const token = await createToken({ userId: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
