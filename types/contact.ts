import type { siteCopy } from "@/content/site-copy";

export type ContactInquiryType = (typeof siteCopy.contact.form.inquiryTypes)[number];

export type ContactPayload = {
  name: string;
  email: string;
  type: ContactInquiryType;
  message: string;
};
