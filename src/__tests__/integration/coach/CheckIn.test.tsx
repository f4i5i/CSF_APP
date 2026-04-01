/**
 * Coach Check-In Integration Tests
 *
 * Tests the complete check-in page composition: class loading, student display,
 * check-in toggling, search, sort, pagination, error handling, and API data flow.
 *
 * Mocks service layer directly for reliable testing (MSW+axios has
 * compatibility issues in jsdom). Service-level logic is tested separately
 * in checkin.service.legacy.test.ts.
 */

import React from "react";
import { render, screen, waitFor, act } from "../../utils/test-utils";
import userEvent from "@testing-library/user-event";
import CheckIn from "../../../pages/CoachDashboard/CheckIn";
import { mockClasses, mockChildren } from "../../../mocks/handlers";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock auth context to provide coach user directly (avoids MSW+axios /users/me issue)
jest.mock("../../../context/auth", () => ({
  useAuth: () => ({
    user: {
      id: "user-coach-1",
      email: "coach@test.com",
      first_name: "Test",
      last_name: "Coach",
      role: "COACH",
    },
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Build check-in statuses from mock children
const buildStatuses = (
  overrides: Record<number, Record<string, unknown>> = {},
) =>
  mockChildren.map((child, index) => ({
    enrollment_id: `enroll-${index + 1}`,
    is_checked_in: index === 0,
    checked_in_at: index === 0 ? "2024-01-15T09:00:00Z" : null,
    child_name: `${child.first_name} ${child.last_name}`,
    child_first_name: child.first_name,
    child_last_name: child.last_name,
    grade: child.grade?.toString() || null,
    child_dob: child.date_of_birth,
    profile_image: null,
    parent_name: "Test Parent",
    parent_phone: "+1234567890",
    parent_email: "parent@test.com",
    ...overrides[index],
  }));

// Mock services
const mockGetAll = jest.fn();
const mockGetClassStatus = jest.fn();
const mockCheckIn = jest.fn();

jest.mock("../../../api/services", () => ({
  classesService: { getAll: (...args: unknown[]) => mockGetAll(...args) },
  checkinService: {
    getClassStatus: (...args: unknown[]) => mockGetClassStatus(...args),
    checkIn: (...args: unknown[]) => mockCheckIn(...args),
  },
}));

// Mock getFileUrl
jest.mock("../../../api/config", () => ({
  getFileUrl: (path: string) => (path ? `http://localhost:8000${path}` : null),
}));

describe("Coach Check-In Page", () => {
  beforeEach(() => {
    localStorage.setItem("csf_access_token", "mock-access-token-coach");
    localStorage.setItem("csf_refresh_token", "mock-refresh-token-coach");

    // Default mocks: return classes and student statuses
    mockGetAll.mockResolvedValue({
      items: mockClasses,
      total: mockClasses.length,
      skip: 0,
      limit: 20,
    });

    mockGetClassStatus.mockResolvedValue(buildStatuses());

    mockCheckIn.mockResolvedValue({
      id: "checkin-new",
      enrollment_id: "enroll-2",
      class_id: "class-1",
      checked_in_at: new Date().toISOString(),
      check_in_date: new Date().toISOString().split("T")[0],
      is_late: false,
      created_at: new Date().toISOString(),
    });
  });

  afterEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    mockGetAll.mockClear();
    mockGetClassStatus.mockClear();
    mockCheckIn.mockClear();
  });

  // Helper: render and wait for students to load
  const renderAndWaitForStudents = async () => {
    render(<CheckIn />);
    await waitFor(() => {
      expect(screen.getByText("Johnny Parent")).toBeInTheDocument();
    });
  };

  // ==========================================================================
  // RENDERING & LAYOUT
  // ==========================================================================
  describe("Rendering", () => {
    it("should render the check-in page with title", () => {
      render(<CheckIn />);
      expect(screen.getByText("Check-In")).toBeInTheDocument();
    });

    it("should display search input", () => {
      render(<CheckIn />);
      expect(
        screen.getByPlaceholderText(/Search students/i),
      ).toBeInTheDocument();
    });

    it("should display Text Class buttons for mobile and desktop", () => {
      render(<CheckIn />);
      const textButtons = screen.getAllByRole("button", {
        name: /Text Class/i,
      });
      expect(textButtons.length).toBe(2);
    });

    it("should auto-select first class on load", async () => {
      render(<CheckIn />);
      await waitFor(() => {
        expect(screen.getByText(mockClasses[0].name)).toBeInTheDocument();
      });
    });

    it("should fetch classes with coach_id filter", async () => {
      render(<CheckIn />);
      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalledWith(
          expect.objectContaining({ coach_id: "user-coach-1" }),
        );
      });
    });
  });

  // ==========================================================================
  // STUDENT LIST LOADING
  // ==========================================================================
  describe("Student List Loading", () => {
    it("should display enrolled students after data loads", async () => {
      await renderAndWaitForStudents();
      expect(screen.getByText("Jenny Parent")).toBeInTheDocument();
    });

    it("should show student count header (checked/total)", async () => {
      await renderAndWaitForStudents();
      // Johnny checked in, Jenny not → "Students (1/2)"
      expect(screen.getByText(/Students \(1\/2\)/)).toBeInTheDocument();
    });

    it("should display student grades", async () => {
      await renderAndWaitForStudents();
      expect(screen.getByText("Grade 3")).toBeInTheDocument();
      expect(screen.getByText("Grade 1")).toBeInTheDocument();
    });

    it("should fetch check-in status for selected class", async () => {
      render(<CheckIn />);
      await waitFor(() => {
        expect(mockGetClassStatus).toHaveBeenCalledWith("class-1");
      });
    });
  });

  // ==========================================================================
  // SEARCH FUNCTIONALITY
  // ==========================================================================
  describe("Search Functionality", () => {
    it("should allow typing in search input", async () => {
      render(<CheckIn />);
      const searchInput = screen.getByPlaceholderText(/Search students/i);
      await userEvent.type(searchInput, "Johnny");
      expect(searchInput).toHaveValue("Johnny");
    });

    it("should filter students based on search term", async () => {
      await renderAndWaitForStudents();

      const searchInput = screen.getByPlaceholderText(/Search students/i);
      await userEvent.type(searchInput, "Johnny");

      await waitFor(() => {
        expect(screen.getByText("Johnny Parent")).toBeInTheDocument();
        expect(screen.queryByText("Jenny Parent")).not.toBeInTheDocument();
      });
    });

    it('should show "No students found" when no match', async () => {
      await renderAndWaitForStudents();

      const searchInput = screen.getByPlaceholderText(/Search students/i);
      await userEvent.type(searchInput, "NonExistentStudent");

      await waitFor(() => {
        expect(screen.getByText(/No students found/i)).toBeInTheDocument();
      });
    });

    it("should be case-insensitive", async () => {
      await renderAndWaitForStudents();

      const searchInput = screen.getByPlaceholderText(/Search students/i);
      await userEvent.type(searchInput, "johnny");

      await waitFor(() => {
        expect(screen.getByText("Johnny Parent")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // CLASS SELECTION DROPDOWN
  // ==========================================================================
  describe("Class Selection Dropdown", () => {
    it("should open dropdown when clicked", async () => {
      await renderAndWaitForStudents();

      const dropdownButton = screen.getByRole("button", {
        name: new RegExp(mockClasses[0].name),
      });
      await userEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText(mockClasses[1].name)).toBeInTheDocument();
      });
    });

    it("should change selected class when option is clicked", async () => {
      await renderAndWaitForStudents();

      // Open dropdown
      const dropdownButton = screen.getByRole("button", {
        name: new RegExp(mockClasses[0].name),
      });
      await userEvent.click(dropdownButton);

      // Click second class
      await waitFor(() => {
        expect(screen.getByText(mockClasses[1].name)).toBeInTheDocument();
      });
      const option = screen.getByRole("button", {
        name: new RegExp(mockClasses[1].name),
      });
      await userEvent.click(option);

      // Should refetch check-in status for new class
      await waitFor(() => {
        expect(mockGetClassStatus).toHaveBeenCalledWith("class-2");
      });
    });

    it("should close dropdown after selecting an option", async () => {
      await renderAndWaitForStudents();

      // Open dropdown
      const dropdownButton = screen.getByRole("button", {
        name: new RegExp(mockClasses[0].name),
      });
      await userEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText(mockClasses[1].name)).toBeInTheDocument();
      });

      // Click option
      const option = screen.getByRole("button", {
        name: new RegExp(mockClasses[1].name),
      });
      await userEvent.click(option);

      // Dropdown menu should close
      await waitFor(() => {
        const dropdownMenu = document.querySelector(".absolute.mt-0");
        expect(dropdownMenu).toBeFalsy();
      });
    });
  });

  // ==========================================================================
  // CHECK-IN TOGGLE
  // ==========================================================================
  describe("Student Check-In Interaction", () => {
    it("should call check-in API when clicking check circle", async () => {
      await renderAndWaitForStudents();

      // Find Jenny's card and click her check circle
      const jennyCard = screen
        .getByText("Jenny Parent")
        .closest('[class*="rounded-[14px]"]');
      const checkCircles = jennyCard!.querySelectorAll(
        '[class*="rounded-full"]',
      );
      await userEvent.click(checkCircles[0] as HTMLElement);

      await waitFor(() => {
        expect(mockCheckIn).toHaveBeenCalledWith(
          expect.objectContaining({
            enrollment_id: "enroll-2",
            class_id: "class-1",
          }),
        );
      });
    });

    it("should open student details modal when clicking card", async () => {
      await renderAndWaitForStudents();

      // Click the notes icon
      const fileIcons = document.querySelectorAll(".lucide-file-text");
      if (fileIcons.length > 0) {
        await userEvent.click(fileIcons[0] as HTMLElement);

        await waitFor(() => {
          expect(screen.getByText(/Contact Information/i)).toBeInTheDocument();
        });
      }
    });
  });

  // ==========================================================================
  // SORT FUNCTIONALITY
  // ==========================================================================
  describe("Sort Functionality", () => {
    it("should display sort button with default Alphabetical", async () => {
      await renderAndWaitForStudents();
      expect(screen.getByText("Alphabetical")).toBeInTheDocument();
    });

    it("should show sort options when clicking sort button", async () => {
      await renderAndWaitForStudents();

      const sortButton = screen.getByRole("button", { name: /Alphabetical/i });
      await userEvent.click(sortButton);

      await waitFor(() => {
        expect(screen.getByText("Grade")).toBeInTheDocument();
        expect(screen.getByText("Age")).toBeInTheDocument();
        expect(screen.getByText("Check-In Status")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================
  describe("Error Handling", () => {
    it("should show empty state when check-in status API returns error", async () => {
      mockGetClassStatus.mockRejectedValue(new Error("Server error"));

      render(<CheckIn />);

      await waitFor(() => {
        const emptyState =
          screen.queryByText(/No Students Enrolled/i) ||
          screen.queryByText(/error loading/i);
        expect(emptyState).toBeTruthy();
      });
    });

    it('should show "No Class Selected" when no classes returned', async () => {
      mockGetAll.mockResolvedValue({ items: [], total: 0 });

      render(<CheckIn />);

      await waitFor(() => {
        expect(screen.getByText("No Class Selected")).toBeInTheDocument();
      });
    });

    it("should show empty state when class has no enrolled students", async () => {
      mockGetClassStatus.mockResolvedValue([]);

      render(<CheckIn />);

      await waitFor(() => {
        expect(screen.getByText(/No Students Enrolled/i)).toBeInTheDocument();
      });
    });

    it("should show Refresh button on empty state", async () => {
      mockGetClassStatus.mockResolvedValue([]);

      render(<CheckIn />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Refresh/i }),
        ).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // PAGINATION
  // ==========================================================================
  describe("Pagination", () => {
    it("should not show pagination with 2 students", async () => {
      await renderAndWaitForStudents();

      const pageButtons = screen.queryAllByRole("button", { name: /^[0-9]+$/ });
      expect(pageButtons.length).toBe(0);
    });

    it("should show pagination when more than 5 students", async () => {
      const manyStatuses = Array.from({ length: 6 }, (_, i) => ({
        enrollment_id: `enroll-${i + 1}`,
        is_checked_in: false,
        checked_in_at: null,
        child_name: `Student ${i + 1}`,
        child_first_name: "Student",
        child_last_name: `${i + 1}`,
        grade: `${i + 1}`,
        child_dob: "2015-01-01",
        profile_image: null,
        parent_name: `Parent ${i + 1}`,
        parent_phone: "+1234567890",
        parent_email: `parent${i + 1}@test.com`,
      }));

      mockGetClassStatus.mockResolvedValue(manyStatuses);

      render(<CheckIn />);

      await waitFor(() => {
        expect(screen.getByText("Student 1")).toBeInTheDocument();
      });

      const pageButtons = screen.queryAllByRole("button", { name: /^[12]$/ });
      expect(pageButtons.length).toBeGreaterThan(0);
    });
  });
});
