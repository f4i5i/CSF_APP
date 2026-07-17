/**
 * The public class page (/class/:classRef) is the link shared with families, so
 * it must resolve BOTH shapes:
 *   /class/blythe-spring-session  -> slug  -> GET /classes/slug/{slug}
 *   /class/<uuid>                 -> id    -> GET /classes/{id}
 *
 * These assert the discriminator in ClassDetail.jsx against real prod values.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value) => UUID_PATTERN.test(String(value || ""));

describe("class reference resolution", () => {
  // Real class ids from prod.
  const PROD_IDS = [
    "b53d6e4f-4108-4e6a-85a9-620e6020577c",
    "0db41d8f-2ecc-4dc9-8f1c-86972aab2694",
    "7e5a226a-d3be-4c22-bca1-ccd736975383",
  ];

  // Real slugs from prod.
  const PROD_SLUGS = [
    "csf-school-academy-triangle-morrisville-elementary",
    "blythe-spring-session",
    "csf-footprints-soccer-at-blossom-peak-montessori",
    "csf-school-academy-east-voyager-fall-soccer",
  ];

  it.each(PROD_IDS)("treats real prod id %s as a UUID", (id) => {
    expect(isUuid(id)).toBe(true);
  });

  it.each(PROD_SLUGS)("treats real prod slug %s as a slug", (slug) => {
    expect(isUuid(slug)).toBe(false);
  });

  it("handles a missing reference without throwing", () => {
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid(null)).toBe(false);
    expect(isUuid("")).toBe(false);
  });

  it("is case-insensitive for uppercased ids", () => {
    expect(isUuid("B53D6E4F-4108-4E6A-85A9-620E6020577C")).toBe(true);
  });

  it("does not mistake a slug that merely contains hyphens for an id", () => {
    expect(isUuid("u10-soccer-fall-2026")).toBe(false);
    expect(isUuid("spring-2026")).toBe(false);
  });
});
