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

export interface CompanyRecord {
  id: string;
  companyName: string;
  jobType: string;
  interviewPhase: string;
  companyPhilosophy: string;
  desiredTalent: string;
  articles: string;
  generatedContent: GeneratedContent | null;
  createdAt: string;
  updatedAt: string;
}

const COMPANIES_KEY = "naiteiNaviCompanies";

export function getCompanies(): CompanyRecord[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(COMPANIES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getCompany(id: string): CompanyRecord | null {
  return getCompanies().find((c) => c.id === id) ?? null;
}

export function saveCompany(company: CompanyRecord): void {
  const companies = getCompanies();
  const index = companies.findIndex((c) => c.id === company.id);
  if (index >= 0) {
    companies[index] = { ...company, updatedAt: new Date().toISOString() };
  } else {
    companies.unshift(company);
  }
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
}

export function deleteCompany(id: string): void {
  const companies = getCompanies().filter((c) => c.id !== id);
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
}

export const PHASE_STYLES: Record<string, string> = {
  "1次面接": "bg-blue-50 text-blue-700 border border-blue-200",
  "2次面接": "bg-orange-50 text-orange-700 border border-orange-200",
  "最終面接": "bg-red-50 text-red-700 border border-red-200",
  "内定": "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export const PHASE_ORDER = ["1次面接", "2次面接", "最終面接", "内定"];
