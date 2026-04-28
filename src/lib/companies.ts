// Company types and constants used across client and server code.
// Data operations are now handled via /api/companies/* API routes.

export interface ReverseQuestion {
  opinion: string;
  question: string;
}

export interface AnticipatedQuestion {
  category?: string;
  intent?: string;
  hook?: string;
  question: string;
  answerShort?: string;
  answer: string;
  followUps?: string[];
  mustMention?: string[];
  risk?: string;
  pivot?: string;
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
  anticipatedQuestions?: AnticipatedQuestion[];
  preInterviewMemo?: string;
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

export const PHASE_STYLES: Record<string, string> = {
  "1次面接": "bg-[rgba(26,45,122,0.06)] text-[#4a5780] border border-[rgba(26,45,122,0.12)]",
  "2次面接": "bg-[rgba(26,45,122,0.11)] text-[#1a2d7a] border border-[rgba(26,45,122,0.18)]",
  "最終面接": "bg-[#1a2d7a] text-white border border-[#1a2d7a]",
  "内定": "bg-[#1a7fe5] text-white border border-[#1a7fe5]",
};

export const PHASE_ORDER = ["1次面接", "2次面接", "最終面接", "内定"];
