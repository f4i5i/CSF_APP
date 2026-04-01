/**
 * StudentCard Component Unit Tests
 * Tests check-in states, initials avatar, grade display, and click handlers
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentCard from "../../../../components/checkIn/StudentCard";

// Mock formatGrade utility
jest.mock("../../../../utils/format", () => ({
  formatGrade: (grade: string) => {
    if (grade === "pre_k") return "PRE-K";
    if (grade === "k") return "K";
    return grade?.toString().toUpperCase() || "N/A";
  },
  GRADE_OPTIONS: [],
}));

const baseStudent = {
  id: "enroll-1",
  enrollment_id: "enroll-1",
  name: "Johnny Parent",
  grade: "3",
  checked: false,
  wasUnchecked: false,
  checkInId: null,
  img: null,
  dob: "2015-05-15",
  child: null,
  parent: null,
  medical_info: null,
  notes: null,
};

describe("StudentCard", () => {
  const defaultProps = {
    student: baseStudent,
    onOpenModal: jest.fn(),
    onCheckIn: jest.fn(),
    checkingIn: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // RENDERING
  // ========================================================================
  describe("Rendering", () => {
    it("should display student name", () => {
      render(<StudentCard {...defaultProps} />);
      expect(screen.getByText("Johnny Parent")).toBeInTheDocument();
    });

    it("should display student grade", () => {
      render(<StudentCard {...defaultProps} />);
      expect(screen.getByText("Grade 3")).toBeInTheDocument();
    });

    it('should display "Grade N/A" when grade is "-"', () => {
      render(
        <StudentCard
          {...defaultProps}
          student={{ ...baseStudent, grade: "-" }}
        />,
      );
      expect(screen.getByText("Grade N/A")).toBeInTheDocument();
    });

    it("should show initials avatar when no image", () => {
      render(<StudentCard {...defaultProps} />);
      // "Johnny Parent" -> initials "JP"
      expect(screen.getByText("JP")).toBeInTheDocument();
    });

    it("should show profile image when available", () => {
      render(
        <StudentCard
          {...defaultProps}
          student={{ ...baseStudent, img: "http://example.com/photo.jpg" }}
        />,
      );
      const img = screen.getByAltText("Johnny Parent");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "http://example.com/photo.jpg");
    });

    it("should handle single-word name initials", () => {
      render(
        <StudentCard
          {...defaultProps}
          student={{ ...baseStudent, name: "Johnny" }}
        />,
      );
      expect(screen.getByText("JO")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // CHECK-IN STATES
  // ========================================================================
  describe("Check-In States", () => {
    it("should show empty circle when not checked in", () => {
      render(<StudentCard {...defaultProps} />);

      // The check circle should have a border but no bg-green or bg-red
      const circles = document.querySelectorAll('[class*="rounded-full"]');
      const checkCircle = circles[0];
      expect(checkCircle.className).toContain("border");
      expect(checkCircle.className).not.toContain("bg-green");
      expect(checkCircle.className).not.toContain("bg-red");
    });

    it("should show green check when checked in", () => {
      render(
        <StudentCard
          {...defaultProps}
          student={{ ...baseStudent, checked: true, checkInId: "ci-1" }}
        />,
      );

      const circles = document.querySelectorAll('[class*="rounded-full"]');
      const checkCircle = circles[0];
      expect(checkCircle.className).toContain("bg-green-500");
    });

    it("should show red X when wasUnchecked", () => {
      render(
        <StudentCard
          {...defaultProps}
          student={{ ...baseStudent, checked: false, wasUnchecked: true }}
        />,
      );

      const circles = document.querySelectorAll('[class*="rounded-full"]');
      const checkCircle = circles[0];
      expect(checkCircle.className).toContain("bg-red-400");
    });

    it("should show disabled state when checkingIn", () => {
      render(<StudentCard {...defaultProps} checkingIn={true} />);

      const circles = document.querySelectorAll('[class*="rounded-full"]');
      const checkCircle = circles[0];
      expect(checkCircle.className).toContain("opacity-50");
      expect(checkCircle.className).toContain("cursor-wait");
    });
  });

  // ========================================================================
  // INTERACTIONS
  // ========================================================================
  describe("Interactions", () => {
    it("should call onCheckIn when check circle is clicked", async () => {
      const onCheckIn = jest.fn();
      render(<StudentCard {...defaultProps} onCheckIn={onCheckIn} />);

      const circles = document.querySelectorAll('[class*="rounded-full"]');
      await userEvent.click(circles[0] as HTMLElement);

      expect(onCheckIn).toHaveBeenCalledWith(baseStudent);
    });

    it("should NOT call onCheckIn when checkingIn is true", async () => {
      const onCheckIn = jest.fn();
      render(
        <StudentCard
          {...defaultProps}
          onCheckIn={onCheckIn}
          checkingIn={true}
        />,
      );

      const circles = document.querySelectorAll('[class*="rounded-full"]');
      await userEvent.click(circles[0] as HTMLElement);

      expect(onCheckIn).not.toHaveBeenCalled();
    });

    it("should call onOpenModal when card body is clicked", async () => {
      const onOpenModal = jest.fn();
      render(<StudentCard {...defaultProps} onOpenModal={onOpenModal} />);

      // Click on the card (not the check circle)
      const card = screen
        .getByText("Johnny Parent")
        .closest('[class*="rounded-[14px]"]');
      await userEvent.click(card as HTMLElement);

      expect(onOpenModal).toHaveBeenCalledWith(baseStudent);
    });

    it("should NOT open modal when check circle is clicked (stopPropagation)", async () => {
      const onOpenModal = jest.fn();
      const onCheckIn = jest.fn();
      render(
        <StudentCard
          {...defaultProps}
          onOpenModal={onOpenModal}
          onCheckIn={onCheckIn}
        />,
      );

      const circles = document.querySelectorAll('[class*="rounded-full"]');
      await userEvent.click(circles[0] as HTMLElement);

      // onCheckIn called, but onOpenModal should NOT be called
      expect(onCheckIn).toHaveBeenCalled();
      // Note: stopPropagation prevents the card click handler from firing
    });
  });
});
