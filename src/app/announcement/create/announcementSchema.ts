import { z } from "zod";

export const announcementSchema = z.object({
  titles: z.object({
    "en-US": z.string().min(1, "English title is required").max(50),
  }),
  bannerContents: z.object({
    "en-US": z.string().min(1, "English banner content is required").max(270),
  }),
  terms: z.object({
    "en-US": z.string().min(1, "English terms & conditions are required").max(6500),
  }),
  uploadedFile: z.any().optional(),
  banner: z.number().min(1, "Banner is required"),
  dateFrom: z.date({ required_error: "Start date is required" }),
  dateTo: z.date({ required_error: "End date is required" }),
  mapping: z.array(
    z.object({
      operator: z.string().min(1, "Operator is required"),
      code: z.string().min(1, "Promotion code is required"),
      time: z.object({
        from: z.string(),
        to: z.string(),
      }),
    })
  ).min(1, "At least one Operator must be added"),
}).refine((data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo, {
  message: "The Display Date must be earlier than or equal to the Promotion end date.",
  path: ["dateFrom"],
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>; 