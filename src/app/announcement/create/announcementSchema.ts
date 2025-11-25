import { z } from "zod";

const baseSchema = z.object({
  promotionTitle: z.object({
    'en-US': z.string().min(1, 'English title cannot be left empty.').max(50),
  }).catchall(z.string().max(50)),
  bannerContent: z.object({
    'en-US': z.string().min(1, 'English banner content cannot be left empty.').max(150),
  }).catchall(z.string().max(150)),
  termsAndConditions: z.object({
    'en-US': z.string().min(1, 'English terms & conditions cannot be left empty.').max(1500),
  }).catchall(z.string().max(1500)),
  template: z.number().min(1, 'Banner is required'),
  fromDate: z.date({ required_error: 'Start date is required' }),
  toDate: z.date({ required_error: 'End date is required' }),
  promotionMappings: z.array(
    z.object({
      operatorId: z.string().min(1, 'Operator is required'),
      promotionCode: z.string().min(1, 'Promotion code is required'),
    })
  ).min(1, 'The Announcement must be linked to at least one Promotion code'),
  uploadedFileName: z.any().optional(),
});

export function getAnnouncementSchema(isEditable: boolean) {
  if (isEditable) {
    return baseSchema
      .refine((data) => data.toDate > data.fromDate, {
        message: "From Date must be earlier than To Date",
        path: ["fromDate"],
      })
      .refine((data) => data.fromDate > new Date(), {
        message: "From Date must be greater than the current time",
        path: ["fromDate"],
      });
  }
  return baseSchema;
}

export type AnnouncementFormValues = z.infer<typeof baseSchema>; 