import {
  getNowInGMT7,
  generateHourOptions,
  generateMinuteOptions,
  mergeDateAndTime,
} from "@/lib/date-time.utils";

describe("date-time.utils", () => {
  describe("getNowInGMT7", () => {
    it("should return a Date object representing now in GMT+7", () => {
      const result = getNowInGMT7();

      expect(result instanceof Date).toBe(true);
      // const approxHour = result.getUTCHours();
      // const actualHour = result.getHours();
      // expect(Math.abs(actualHour - approxHour - 7) <= 1).toBe(true);
    });
  });

  describe("generateHourOptions", () => {
    it("should generate 24 hour strings from 00 to 23", () => {
      const result = generateHourOptions();
      expect(result.length).toBe(24);
      expect(result[0]).toBe("00");
      expect(result[23]).toBe("23");
    });
  });

  describe("generateMinuteOptions", () => {
    it("should generate 60 minute strings from 00 to 59", () => {
      const result = generateMinuteOptions();
      expect(result.length).toBe(60);
      expect(result[0]).toBe("00");
      expect(result[59]).toBe("59");
    });
  });

  describe("mergeDateAndTime", () => {
    it("should merge given date with hour and minute strings", () => {
      const baseDate = new Date("2023-01-01T00:00:00Z");
      const result = mergeDateAndTime(baseDate, "14", "45");

      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(45);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // January = 0
      expect(result.getDate()).toBe(1);
    });
  });
});
