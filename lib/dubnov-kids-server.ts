import "server-only";

import { dubnovKidsConfig, type DubnovKidsPlan } from "@/lib/dubnov-kids";

const introPaymentUrl = "https://pay.grow.link/MTAzMDM2~7e96d9099d70e8f2899db1ecccabe432-MzkyOTM0NA";

export function getDubnovKidsGrowConfig(plan: DubnovKidsPlan) {
  const selected = dubnovKidsConfig.plans[plan];
  return {
    url: plan === "trial" ? introPaymentUrl : process.env[selected.envUrl]?.trim() ?? "",
    paymentLinkId: process.env[selected.envPaymentLinkId]?.trim() ?? ""
  };
}
