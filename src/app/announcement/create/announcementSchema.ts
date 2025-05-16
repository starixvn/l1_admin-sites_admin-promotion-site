import { z } from "zod";

export const announcementSchema = z.object({
  promotionTitle: z.object({
    "en-US": z.string().min(1, "English title is required").max(50),
  }),
  bannerContent: z.object({
    "en-US": z.string().min(1, "English banner content is required").max(270),
  }),
  termsAndConditions: z.object({
    "en-US": z.string().min(1, "English terms & conditions are required").max(6500),
  }),
  uploadedFile: z.any().optional(),
  template: z.number().min(1, "Banner is required"),
  fromDate: z.date({ required_error: "Start date is required" }),
  toDate: z.date({ required_error: "End date is required" }),
  promotionMappings: z.array(
    z.object({
      operatorId: z.string().min(1, "Operator is required"),
      promotionCode: z.string().min(1, "Promotion code is required"),
    })
  ).min(1, "At least one Operator must be added"),
}).refine((data) => !data.fromDate || !data.toDate || data.fromDate <= data.toDate, {
  message: "The Display Date must be earlier than or equal to the Promotion end date.",
  path: ["fromDate"],
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>; 