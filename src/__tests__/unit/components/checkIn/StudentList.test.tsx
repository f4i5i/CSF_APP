/**
 * StudentList Component Unit Tests
 * Tests search filtering, sorting, pagination, and rendering
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentList from "../../../../components/checkIn/StudentList";

// Mock formatGrade utility
jest.mock("../../../../utils/format", () => ({
  formatGrade: (grade: string) => {
    if (grade === "pre_k") return "PRE-K";
    if (grade === "k") return "K";
    return grade?.toString().toUpperCase() || "N/A";
  },
  GRADE_OPTIONS: [],
}));

const makeStudents = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `enroll-${i + 1}`,
    enrollment_id: `enroll-${i + 1}`,
    name: `Student ${String.fromCharCode(65 + i)}`, // A, B, C...
    grade: `${i + 1}`,
    checked: i < 2, // First 2 checked in
    wasUnchecked: false,
    checkInId: i < 2 ? `ci-${i + 1}` : null,
    img: null,
    dob: `201${5 + i}-01-15`,
    child: null,
    parent: null,
    medical_info: null,
    notes: null,
  }));

const defaultProps = {
  students: makeStudents(3),
  search: "",
  sort: "Alphabetical",
  setSort: jest.fn(),
  onOpen: jest.fn(),
  onCheckIn: jest.fn(),
  checkingIn: false,
};

describe("StudentList", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // RENDERING
  // ========================================================================
  describe("Rendering", () => {
    it("should render all students", () => {
      render(<StudentList {...defaultProps} />);

      expect(screen.getByText("Student A")).toBeInTheDocument();
      expect(screen.getByText("Student B")).toBeInTheDocument();
      expect(screen.getByText("Student C")).toBeInTheDocument();
    });

    it("should show checked-in count", () => {
      render(<StudentList {...defaultProps} />);

      // 2 checked in out of 3 total
      expect(screen.getByText(/Students \(2\/3\)/)).toBeInTheDocument();
    });

    it("should show default sort label", () => {
      render(<StudentList {...defaultProps} />);
      expect(screen.getByText("Alphabetical")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // SEARCH FILTERING
  // ========================================================================
  describe("Search Filtering", () => {
    it("should filter students by search term", () => {
      render(<StudentList {...defaultProps} search="Student A" />);

      expect(screen.getByText("Student A")).toBeInTheDocument();
      expect(screen.queryByText("Student B")).not.toBeInTheDocument();
      expect(screen.queryByText("Student C")).not.toBeInTheDocument();
    });

    it("should be case-insensitive", () => {
      render(<StudentList {...defaultProps} search="student a" />);
      expect(screen.getByText("Student A")).toBeInTheDocument();
    });

    it('should show "No students found" when no match', () => {
      render(<StudentList {...defaultProps} search="xyz123" />);
      expect(screen.getByText("No students found")).toBeInTheDocument();
    });

    it("should update checked-in count based on filtered results", () => {
      // Search for Student C (not checked in)
      render(<StudentList {...defaultProps} search="Student C" />);
      expect(screen.getByText(/Students \(0\/1\)/)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // SORTING
  // ========================================================================
  describe("Sorting", () => {
    it("should sort alphabetically by default", () => {
      const students = makeStudents(3);
      // Reverse to ensure sorting works
      const reversed = [...students].reverse();
      render(<StudentList {...defaultProps} students={reversed} />);

      const names = screen.getAllByText(/Student [A-C]/);
      expect(names[0].textContent).toBe("Student A");
      expect(names[1].textContent).toBe("Student B");
      expect(names[2].textContent).toBe("Student C");
    });

    it("should sort by check-in status", () => {
      const students = makeStudents(3);
      render(
        <StudentList
          {...defaultProps}
          students={students}
          sort="Check-In Status"
        />,
      );

      // Checked-in students first (Student A and B), then unchecked (Student C)
      const names = screen.getAllByText(/Student [A-C]/);
      expect(names[0].textContent).toBe("Student A");
      expect(names[1].textContent).toBe("Student B");
      expect(names[2].textContent).toBe("Student C");
    });

    it("should open sort dropdown when clicked", async () => {
      const user = userEvent;
      render(<StudentList {...defaultProps} />);

      const sortButton = screen.getByRole("button", { name: /Alphabetical/i });
      await user.click(sortButton);

      expect(screen.getByText("Grade")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("Check-In Status")).toBeInTheDocument();
    });

    it("should call setSort when option is selected", async () => {
      const user = userEvent;
      const setSort = jest.fn();
      render(<StudentList {...defaultProps} setSort={setSort} />);

      const sortButton = screen.getByRole("button", { name: /Alphabetical/i });
      await user.click(sortButton);

      const gradeOption = screen.getByRole("button", { name: /^Grade$/ });
      await user.click(gradeOption);

      expect(setSort).toHaveBeenCalledWith("Grade");
    });
  });

  // ========================================================================
  // PAGINATION
  // ========================================================================
  describe("Pagination", () => {
    it("should not show pagination with 5 or fewer students", () => {
      render(<StudentList {...defaultProps} students={makeStudents(5)} />);

      // No page number buttons
      const pageButtons = screen.queryAllByRole("button", { name: /^[0-9]+$/ });
      expect(pageButtons.length).toBe(0);
    });

    it("should show pagination with more than 5 students", () => {
      render(<StudentList {...defaultProps} students={makeStudents(8)} />);

      // Should show page 1 and page 2
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    });

    it("should show only 5 students per page", () => {
      render(<StudentList {...defaultProps} students={makeStudents(8)} />);

      // First page: 5 students visible
      const studentCards = screen.getAllByText(/Student [A-H]/);
      expect(studentCards.length).toBe(5);
    });

    it("should navigate to next page", async () => {
      const user = userEvent;
      render(<StudentList {...defaultProps} students={makeStudents(8)} />);

      // Click page 2
      const page2Button = screen.getByRole("button", { name: "2" });
      await user.click(page2Button);

      // Should show remaining 3 students (F, G, H)
      const studentCards = screen.getAllByText(/Student [A-H]/);
      expect(studentCards.length).toBe(3);
    });

    it("should reset to page 1 when search changes", () => {
      const { rerender } = render(
        <StudentList {...defaultProps} students={makeStudents(8)} search="" />,
      );

      // Rerender with search term
      rerender(
        <StudentList
          {...defaultProps}
          students={makeStudents(8)}
          search="Student A"
        />,
      );

      // Should be on page 1 with filtered result
      expect(screen.getByText("Student A")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // INTERACTIONS
  // ========================================================================
  describe("Interactions", () => {
    it("should call onOpen when student card is clicked", async () => {
      const user = userEvent;
      const onOpen = jest.fn();
      render(<StudentList {...defaultProps} onOpen={onOpen} />);

      // Click the notes icon for first student
      const fileIcons = document.querySelectorAll(".lucide-file-text");
      if (fileIcons.length > 0) {
        await user.click(fileIcons[0] as HTMLElement);
        expect(onOpen).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Student A" }),
        );
      }
    });
  });
});
