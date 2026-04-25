import { getCurrentUserId } from "./auth";

export interface ReverseQuestion {
  opinion: string;
  question: string;
}

export interface GeneratedContent {
  selfIntro: string;
  motivation: string;
  jobAxis: string;
  strengths: string;
  weaknesses: string;
  careerPlan: string;
  reverseQuestions: ReverseQuestion[];
  closingStatement: string;
}

export interface EsContent {
  esSelfPR: string;
  esAppealPoints: string;
  esMotivation: string;
}

export interface CompanyRecord {
  id: string;
  companyName: string;
  jobType: string;
  interviewPhase: string;
  companyPhilosophy: string;
  desiredTalent: string;
  articles: string;
  generatedContent: GeneratedContent | null;
  esContent?: EsContent | null;
  createdAt: string;
  updatedAt: string;
}

function storageKey(base: string): string {
  const uid = getCurrentUserId();
  return uid ? `gkb_${uid}_${base}` : base;
}

const BASE_KEY = "naiteiNaviCompanies";

export function getCompanies(): CompanyRecord[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(storageKey(BASE_KEY));
  return stored ? JSON.parse(stored) : [];
}

export function getCompany(id: string): CompanyRecord | null {
  return getCompanies().find((c) => c.id === id) ?? null;
}

export function saveCompany(company: CompanyRecord): void {
  const companies = getCompanies();
  const index = companies.findIndex((c) => c.id === company.id);
  const updated = { ...company, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    companies[index] = updated;
  } else {
    companies.unshift(updated);
  }
  localStorage.setItem(storageKey(BASE_KEY), JSON.stringify(companies));
}

export function deleteCompany(id: string): void {
  const companies = getCompanies().filter((c) => c.id !== id);
  localStorage.setItem(storageKey(BASE_KEY), JSON.stringify(companies));
}

export const PHASE_STYLES: Record<string, string> = {
  "1次面接": "bg-[rgba(26,45,122,0.06)] text-[#4a5780] border border-[rgba(26,45,122,0.12)]",
  "2次面接": "bg-[rgba(26,45,122,0.11)] text-[#1a2d7a] border border-[rgba(26,45,122,0.18)]",
  "最終面接": "bg-[#1a2d7a] text-white border border-[#1a2d7a]",
  "内定": "bg-[#1a7fe5] text-white border border-[#1a7fe5]",
};

export const PHASE_ORDER = ["1次面接", "2次面接", "最終面接", "内定"];
