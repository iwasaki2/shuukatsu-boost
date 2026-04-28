import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const COMPANY_INCLUDE = {
  generatedContent: true,
  esContent: true,
} as const;

type CompanyWithRelations = NonNullable<Awaited<ReturnType<typeof prisma.company.findUnique>> & {
  generatedContent: {
    selfIntro: string; motivation: string; jobAxis: string; strengths: string;
    weaknesses: string; careerPlan: string; reverseQuestions: string;
    closingStatement: string; finalInterviewDeepDive: string;
    competitorComparison: string; variations: string;
    anticipatedQuestions: string; preInterviewMemo: string;
  } | null;
  esContent: { esSelfPR: string; esAppealPoints: string; esMotivation: string } | null;
}>;

function serializeCompany(company: CompanyWithRelations) {
  return {
    id: company.id,
    companyName: company.companyName,
    jobType: company.jobType,
    interviewPhase: company.interviewPhase,
    companyPhilosophy: company.companyPhilosophy,
    desiredTalent: company.desiredTalent,
    articles: company.articles,
    strengthsOverride: company.strengthsOverride ?? undefined,
    weaknessesOverride: company.weaknessesOverride ?? undefined,
    motivationMemo: company.motivationMemo ?? undefined,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
    generatedContent: company.generatedContent
      ? {
          selfIntro: company.generatedContent.selfIntro,
          motivation: company.generatedContent.motivation,
          jobAxis: company.generatedContent.jobAxis,
          strengths: company.generatedContent.strengths,
          weaknesses: company.generatedContent.weaknesses,
          careerPlan: company.generatedContent.careerPlan,
          reverseQuestions: JSON.parse(company.generatedContent.reverseQuestions),
          closingStatement: company.generatedContent.closingStatement,
          finalInterviewDeepDive: company.generatedContent.finalInterviewDeepDive || undefined,
          competitorComparison: company.generatedContent.competitorComparison || undefined,
          variations: JSON.parse(company.generatedContent.variations),
          anticipatedQuestions: JSON.parse(company.generatedContent.anticipatedQuestions || "[]"),
          preInterviewMemo: company.generatedContent.preInterviewMemo || undefined,
        }
      : null,
    esContent: company.esContent ?? null,
  };
}

function normalizeStringList(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const company = await prisma.company.findFirst({
    where: { id, userId: session.userId },
    include: COMPANY_INCLUDE,
  }) as CompanyWithRelations | null;

  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ company: serializeCompany(company) });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.company.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const {
    companyName, jobType, interviewPhase,
    companyPhilosophy, desiredTalent, articles,
    strengthsOverride, weaknessesOverride, motivationMemo,
    generatedContent, esContent,
  } = body;

  await prisma.company.update({
    where: { id },
    data: {
      companyName: companyName ?? existing.companyName,
      jobType: jobType ?? existing.jobType,
      interviewPhase: interviewPhase ?? existing.interviewPhase,
      companyPhilosophy: companyPhilosophy ?? existing.companyPhilosophy,
      desiredTalent: desiredTalent ?? existing.desiredTalent,
      articles: articles ?? existing.articles,
      strengthsOverride: strengthsOverride !== undefined ? (strengthsOverride || null) : existing.strengthsOverride,
      weaknessesOverride: weaknessesOverride !== undefined ? (weaknessesOverride || null) : existing.weaknessesOverride,
      motivationMemo: motivationMemo !== undefined ? (motivationMemo || null) : existing.motivationMemo,
    },
  });

  if (generatedContent !== undefined) {
    const normalizedPreInterviewMemo = normalizeStringList(generatedContent.preInterviewMemo);

    await prisma.generatedContent.upsert({
      where: { companyId: id },
      update: {
        selfIntro: generatedContent.selfIntro ?? "",
        motivation: generatedContent.motivation ?? "",
        jobAxis: generatedContent.jobAxis ?? "",
        strengths: generatedContent.strengths ?? "",
        weaknesses: generatedContent.weaknesses ?? "",
        careerPlan: generatedContent.careerPlan ?? "",
        reverseQuestions: JSON.stringify(generatedContent.reverseQuestions ?? []),
        closingStatement: generatedContent.closingStatement ?? "",
        finalInterviewDeepDive: generatedContent.finalInterviewDeepDive ?? "",
        competitorComparison: generatedContent.competitorComparison ?? "",
        variations: JSON.stringify(generatedContent.variations ?? {}),
        anticipatedQuestions: JSON.stringify(generatedContent.anticipatedQuestions ?? []),
        preInterviewMemo: normalizedPreInterviewMemo,
      },
      create: {
        companyId: id,
        selfIntro: generatedContent.selfIntro ?? "",
        motivation: generatedContent.motivation ?? "",
        jobAxis: generatedContent.jobAxis ?? "",
        strengths: generatedContent.strengths ?? "",
        weaknesses: generatedContent.weaknesses ?? "",
        careerPlan: generatedContent.careerPlan ?? "",
        reverseQuestions: JSON.stringify(generatedContent.reverseQuestions ?? []),
        closingStatement: generatedContent.closingStatement ?? "",
        finalInterviewDeepDive: generatedContent.finalInterviewDeepDive ?? "",
        competitorComparison: generatedContent.competitorComparison ?? "",
        variations: JSON.stringify(generatedContent.variations ?? {}),
        anticipatedQuestions: JSON.stringify(generatedContent.anticipatedQuestions ?? []),
        preInterviewMemo: normalizedPreInterviewMemo,
      },
    });
  }

  if (esContent !== undefined) {
    await prisma.esContent.upsert({
      where: { companyId: id },
      update: {
        esSelfPR: esContent.esSelfPR ?? "",
        esAppealPoints: esContent.esAppealPoints ?? "",
        esMotivation: esContent.esMotivation ?? "",
      },
      create: {
        companyId: id,
        esSelfPR: esContent.esSelfPR ?? "",
        esAppealPoints: esContent.esAppealPoints ?? "",
        esMotivation: esContent.esMotivation ?? "",
      },
    });
  }

  const updated = await prisma.company.findFirst({
    where: { id },
    include: COMPANY_INCLUDE,
  }) as CompanyWithRelations;

  return NextResponse.json({ company: serializeCompany(updated) });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.company.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
