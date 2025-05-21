import { announcementSchema } from "../../../../src/app/announcement/create/announcementSchema";

describe("announcementSchema", () => {
  const validData = {
    promotionTitle: { "en-US": "Title" },
    bannerContent: { "en-US": "Banner" },
    termsAndConditions: { "en-US": "Terms" },
    uploadedFile: undefined,
    template: 1,
    fromDate: new Date("2024-01-01"),
    toDate: new Date("2024-01-10"),
    promotionMappings: [
      { operatorId: "op1", promotionCode: "promo1" }
    ]
  };

  it("passes with valid data", () => {
    expect(() => announcementSchema.parse(validData)).not.toThrow();
  });

  it("fails if English title is missing", () => {
    const data = { ...validData, promotionTitle: { "en-US": "" } };
    expect(() => announcementSchema.parse(data)).toThrow(/English title is required/);
  });

  it("fails if English banner content is missing", () => {
    const data = { ...validData, bannerContent: { "en-US": "" } };
    expect(() => announcementSchema.parse(data)).toThrow(/English banner content is required/);
  });

  it("fails if English terms is missing", () => {
    const data = { ...validData, termsAndConditions: { "en-US": "" } };
    expect(() => announcementSchema.parse(data)).toThrow(/English terms & conditions are required/);
  });

  it("fails if template is less than 1", () => {
    const data = { ...validData, template: 0 };
    expect(() => announcementSchema.parse(data)).toThrow(/Banner is required/);
  });

  it("fails if fromDate is missing", () => {
    const data = { ...validData, fromDate: undefined };
    expect(() => announcementSchema.parse(data)).toThrow(/Start date is required/);
  });

  it("fails if toDate is missing", () => {
    const data = { ...validData, toDate: undefined };
    expect(() => announcementSchema.parse(data)).toThrow(/End date is required/);
  });

  it("fails if fromDate > toDate", () => {
    const data = { ...validData, fromDate: new Date("2024-01-11"), toDate: new Date("2024-01-10") };
    expect(() => announcementSchema.parse(data)).toThrow(/Display Date must be earlier/);
  });

  it("fails if promotionMappings is empty", () => {
    const data = { ...validData, promotionMappings: [] };
    expect(() => announcementSchema.parse(data)).toThrow(/At least one Operator must be added/);
  });

  it("fails if operatorId is missing in mapping", () => {
    const data = { ...validData, promotionMappings: [{ operatorId: "", promotionCode: "promo1" }] };
    expect(() => announcementSchema.parse(data)).toThrow(/Operator is required/);
  });

  it("fails if promotionCode is missing in mapping", () => {
    const data = { ...validData, promotionMappings: [{ operatorId: "op1", promotionCode: "" }] };
    expect(() => announcementSchema.parse(data)).toThrow(/Promotion code is required/);
  });

  it("accepts additional languages for title, banner, and terms", () => {
    const data = {
      ...validData,
      promotionTitle: { "en-US": "Title", "vi-VN": "Tiêu đề" },
      bannerContent: { "en-US": "Banner", "vi-VN": "Biểu ngữ" },
      termsAndConditions: { "en-US": "Terms", "vi-VN": "Điều khoản" }
    };
    expect(() => announcementSchema.parse(data)).not.toThrow();
  });

  it("fails if title exceeds 50 chars", () => {
    const data = { ...validData, promotionTitle: { "en-US": "a".repeat(51) } };
    expect(() => announcementSchema.parse(data)).toThrow();
  });

  it("fails if bannerContent exceeds 270 chars", () => {
    const data = { ...validData, bannerContent: { "en-US": "a".repeat(271) } };
    expect(() => announcementSchema.parse(data)).toThrow();
  });

  it("fails if termsAndConditions exceeds 6500 chars", () => {
    const data = { ...validData, termsAndConditions: { "en-US": "a".repeat(6501) } };
    expect(() => announcementSchema.parse(data)).toThrow();
  });
});
