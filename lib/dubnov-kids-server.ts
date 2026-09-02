import "server-only";

import { dubnovKidsConfig, type DubnovKidsPlan } from "@/lib/dubnov-kids";

const paymentUrls: Record<DubnovKidsPlan, string> = {
  trial: "https://pay.grow.link/MTAzMDM2~7e96d9099d70e8f2899db1ecccabe432-MzkyOTM0NA",
  single: "https://pay.grow.link/MTAzMDM2~18ab579f1fef6398ec5859d856cf4e87-MzkzMTgwMw",
  monthly: "https://pay.grow.link/MTAzMDM2~dfda365100439cc8523c2a9657641c2b-MzkzMTgxNw"
};

export function getDubnovKidsGrowConfig(plan: DubnovKidsPlan) {
  const selected = dubnovKidsConfig.plans[plan];
  return {
    url: paymentUrls[plan] || process.env[selected.envUrl]?.trim() || "",
    paymentLinkId: process.env[selected.envPaymentLinkId]?.trim() ?? ""
  };
}
