import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getEffectivePlan, isDevelopmentPlanBypass, type PlanId } from "@/lib/plans";

function serializeCompany(company: {
  id: string;
  userId: string;
  companyName: string;
  jobType: string;
  interviewPhase: string;
  companyPhilosophy: string;
  desiredTalent: string;
  articles: string;
  strengthsOverride: string | null;
  weaknessesOverride: string | null;
  motivationMemo: string | null;
  createdAt: Date;
  updatedAt: Date;
  generatedContent: {
    selfIntro: string;
    motivation: string;
    jobAxis: string;
    strengths: string;
    weaknesses: string;
    careerPlan: string;
    reverseQuestions: string;
    closingStatement: string;
    finalInterviewDeepDive: string;
    competitorComparison: string;
    variations: string;
  } | null;
  esContent: {
    esSelfPR: string;
    esAppealPoints: string;
    esMotivation: string;
  } | null;
}) {
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
        }
      : null,
    esContent: company.esContent
      ? {
          esSelfPR: company.esContent.esSelfPR,
          esAppealPoints: company.esContent.esAppealPoints,
          esMotivation: company.esContent.esMotivation,
        }
      : null,
  };
}

const COMPANY_INCLUDE = {
  generatedContent: true,
  esContent: true,
} as const;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ companies: [] });
  }

  const companies = await prisma.company.findMany({
    where: { userId: session.userId },
    include: COMPANY_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ companies: companies.map(serializeCompany) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    companyName, jobType, interviewPhase,
    companyPhilosophy, desiredTalent, articles,
    strengthsOverride, weaknessesOverride, motivationMemo,
    generatedContent, esContent,
  } = body;

  if (!companyName || !jobType) {
    return NextResponse.json({ error: "企業名と希望職種は必須です" }, { status: 400 });
  }

  const userPlan = await prisma.userPlan.findUnique({ where: { userId: session.userId } });
  const planId = (userPlan?.planId ?? "starter") as PlanId;
  const plan = getEffectivePlan(planId);

  if (!isDevelopmentPlanBypass() && plan.limits.maxCompanies !== Infinity) {
    const count = await prisma.company.count({ where: { userId: session.userId } });
    if (count >= plan.limits.maxCompanies) {
      return NextResponse.json(
        { error: `Starterプランでは${plan.limits.maxCompanies}社までです。Growthプランにアップグレードしてください。` },
        { status: 403 }
      );
    }
  }

  const company = await prisma.company.create({
    data: {
      userId: session.userId,
      companyName,
      jobType,
      interviewPhase: interviewPhase ?? "1次面接",
      companyPhilosophy: companyPhilosophy ?? "",
      desiredTalent: desiredTalent ?? "",
      articles: articles ?? "",
      strengthsOverride: strengthsOverride || null,
      weaknessesOverride: weaknessesOverride || null,
      motivationMemo: motivationMemo || null,
      generatedContent: generatedContent
        ? {
            create: {
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
            },
          }
        : undefined,
      esContent: esContent
        ? {
            create: {
              esSelfPR: esContent.esSelfPR ?? "",
              esAppealPoints: esContent.esAppealPoints ?? "",
              esMotivation: esContent.esMotivation ?? "",
            },
          }
        : undefined,
    },
    include: COMPANY_INCLUDE,
  });

  return NextResponse.json({ company: serializeCompany(company) }, { status: 201 });
}
