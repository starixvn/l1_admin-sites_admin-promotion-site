export interface Announcement {
    _id: string;
    promotionTitle: Record<string, string>;
    bannerContent: Record<string, string>;
    termsAndConditions: Record<string, string>;
    fromDate: string;
    toDate: string;
    promotionMappings: {
      operatorId: string;
      promotionCode: string;
    }[];
    template: number;
    createdAt: string;
    updatedAt: string;
  }