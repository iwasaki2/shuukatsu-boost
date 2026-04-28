export type PlanId = "starter" | "growth" | "executive";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  limits: {
    maxCompanies: number;
    esGeneration: boolean;
    memorization: boolean;
    finalInterview: boolean;
    bulkOperations: boolean;
  };
  stripePriceEnvKey?: string;
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "¥0",
    description: "まず試してみたい方に",
    features: [
      "企業2社まで登録",
      "面接回答を自動生成",
      "プロフィール保存",
      "1次・2次面接対応",
    ],
    limits: {
      maxCompanies: 2,
      esGeneration: false,
      memorization: false,
      finalInterview: false,
      bulkOperations: false,
    },
  },
  {
    id: "growth",
    name: "Growth",
    price: 980,
    priceLabel: "¥980",
    description: "就活を本格的に進めたい方に",
    features: [
      "企業数無制限",
      "面接回答を自動生成（高品質モデル）",
      "ES・書類対策（自己PR・アピールポイント・志望理由）",
      "暗記モードで練習",
      "1次〜最終面接すべて対応",
      "一括削除・管理機能",
    ],
    limits: {
      maxCompanies: Infinity,
      esGeneration: true,
      memorization: true,
      finalInterview: true,
      bulkOperations: true,
    },
    stripePriceEnvKey: "STRIPE_GROWTH_PRICE_ID",
    featured: true,
  },
  {
    id: "executive",
    name: "Executive",
    price: 1980,
    priceLabel: "¥1,980",
    description: "最終面接まで万全の準備を",
    features: [
      "Growthのすべての機能",
      "最高品質AIモデルで生成",
      "最終面接特化の深掘り生成",
      "競合他社との比較軸を生成",
      "回答の複数バリエーション生成",
      "優先生成（混雑時も高速）",
    ],
    limits: {
      maxCompanies: Infinity,
      esGeneration: true,
      memorization: true,
      finalInterview: true,
      bulkOperations: true,
    },
    stripePriceEnvKey: "STRIPE_EXECUTIVE_PRICE_ID",
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}
