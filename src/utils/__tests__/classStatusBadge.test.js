import { getClassStatusBadge } from "../format";

describe("getClassStatusBadge", () => {
  test("completed status → Completed (gray)", () => {
    const b = getClassStatusBadge({ status: "completed", is_active: false });
    expect(b.label).toBe("Completed");
    expect(b.className).toContain("gray");
  });

  test("active class → Active", () => {
    const b = getClassStatusBadge({ status: "active", is_active: true });
    expect(b.label).toBe("Active");
  });

  test("inactive, non-completed → Draft", () => {
    const b = getClassStatusBadge({ status: "active", is_active: false });
    expect(b.label).toBe("Draft");
  });

  test("completed wins over is_active=true", () => {
    const b = getClassStatusBadge({ status: "completed", is_active: true });
    expect(b.label).toBe("Completed");
  });
});
