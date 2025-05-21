import { parseSiteInput } from "@/lib/promotion/promotion.utils";

describe("parseSiteInput", () => {
  it("returns an empty array for empty string", () => {
    expect(parseSiteInput("")).toEqual([]);
  });

  it("splits a single site correctly", () => {
    expect(parseSiteInput("site1")).toEqual(["site1"]);
  });

  it("splits multiple sites correctly", () => {
    expect(parseSiteInput("site1;site2;site3")).toEqual(["site1", "site2", "site3"]);
  });

  it("trims spaces around each site", () => {
    expect(parseSiteInput(" site1 ; site2 ;  site3 ")).toEqual(["site1", "site2", "site3"]);
  });

  it("filters out empty and whitespace-only entries", () => {
    expect(parseSiteInput("site1;; ;site2;")).toEqual(["site1", "site2"]);
  });

  it("removes duplicate site names", () => {
    expect(parseSiteInput("site1;site2;site1;site2")).toEqual(["site1", "site2"]);
  });

  it("handles input with only separators", () => {
    expect(parseSiteInput(";;;")).toEqual([]);
  });

  it("handles mix of valid, empty, and duplicate entries", () => {
    expect(parseSiteInput("site1; ;site2;site1;;site3")).toEqual(["site1", "site2", "site3"]);
  });
});
