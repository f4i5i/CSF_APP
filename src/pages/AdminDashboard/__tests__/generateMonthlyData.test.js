/**
 * Unit tests for the Financials monthly revenue rollup.
 *
 * Shapes here mirror what /admin/finance/revenue actually returns
 * (api/v1/admin.py:511-521): each date carries the per-payment-type keys plus a
 * pre-computed "total".
 */

import { generateMonthlyData } from "../Financials";

const JAN = 0;
const MAR = 2;
const APR = 3;

describe("generateMonthlyData", () => {
  it("counts a day's revenue once, not twice", () => {
    // Real prod shape: "total" already equals the sum of the type keys.
    const report = {
      revenue_by_date: {
        "2026-04-10": {
          one_time: 4463.14,
          subscription: 0,
          installment: 0,
          total: 4463.14,
        },
      },
    };

    // Summing every value in the entry would double this to 8926.28.
    expect(generateMonthlyData(report)[APR]).toBe(4463.14);
  });

  it("does not double-count when several payment types land on one day", () => {
    const report = {
      revenue_by_date: {
        "2026-01-05": {
          one_time: 100,
          subscription: 50,
          installment: 25,
          total: 175,
        },
      },
    };

    expect(generateMonthlyData(report)[JAN]).toBe(175);
  });

  it("falls back to summing type keys when total is absent", () => {
    const report = {
      revenue_by_date: {
        "2026-01-05": { one_time: 100, subscription: 50 },
      },
    };

    expect(generateMonthlyData(report)[JAN]).toBe(150);
  });

  it("buckets the first of the month into that month, not the previous one", () => {
    // Prod has a real payment on 2026-04-01. new Date("2026-04-01") parses as
    // UTC midnight, which is March 31 in US timezones.
    const report = {
      revenue_by_date: {
        "2026-04-01": { one_time: 657.56, total: 657.56 },
      },
    };

    const monthly = generateMonthlyData(report);
    expect(monthly[APR]).toBe(657.56);
    expect(monthly[MAR]).toBe(0);
  });

  it("sums multiple days within the same month", () => {
    const report = {
      revenue_by_date: {
        "2026-04-01": { one_time: 100, total: 100 },
        "2026-04-20": { one_time: 200, total: 200 },
      },
    };

    expect(generateMonthlyData(report)[APR]).toBe(300);
  });

  it("returns all zeros when there is no revenue -- never invented sample data", () => {
    const sampleData = [200, 300, 250, 280, 310, 340, 360, 380, 400, 420, 450, 480];

    expect(generateMonthlyData({ revenue_by_date: {} })).toEqual(Array(12).fill(0));
    expect(generateMonthlyData({})).toEqual(Array(12).fill(0));
    expect(generateMonthlyData(null)).toEqual(Array(12).fill(0));
    expect(generateMonthlyData({ revenue_by_date: {} })).not.toEqual(sampleData);
  });
});
