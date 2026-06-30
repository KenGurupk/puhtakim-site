export type ContactInquiryType = "הזמנה" | "סדנה" | "הפקה" | "שיתוף פעולה" | "חנות";

export type ContactPayload = {
  name: string;
  email: string;
  type: ContactInquiryType;
  message: string;
};
