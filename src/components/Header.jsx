// ============================================================================
// IMPORTS
// ============================================================================

// React core and hooks
import { useEffect, useRef, useState } from "react";
import React from "react";

// Routing
import { Link, NavLink, useNavigate } from "react-router-dom";

// Icons - Lucide React
import {
  Home,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Image,
  User,
  CreditCard,
  Phone,
  Lock,
  LogOut,
  ChevronDown,
  UserPlus,
  Settings,
  Users,
  GraduationCap,
  Wallet,
  MessageCircle,
  X,
} from "lucide-react";

// Icons - Material UI
import { Person } from "@mui/icons-material";

// Components
import Logo from "./Logo";
import AdminSidebar from "./AdminSidebar/AdminSidebar";

// Context
import { useAuth } from "../context/auth";

// Assets
import logo from "../assets/person.png";
import baseLogo from "../assets/logo.png";

// ============================================================================
// HEADER COMPONENT
// ============================================================================
const Header = () => {
  // ------------------------------------------------------------------------
  // STATE & REFS
  // ------------------------------------------------------------------------
  // Get user role from localStorage for role-based rendering
  const role = localStorage.getItem("role");

  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // Auth context for user data and logout functionality
  const { user, logout } = useAuth();

  // Dropdown menu state for admin profile menu
  const [open, setOpen] = useState(false);

  // Mobile sidebar state for hamburger menu
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ref for click-outside detection on dropdown
  const dropdownRef = useRef(null);

  // ------------------------------------------------------------------------
  // EFFECTS
  // ------------------------------------------------------------------------
  // Close dropdown when clicking outside (for admin dropdown)
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ------------------------------------------------------------------------
  // HELPER COMPONENTS
  // ------------------------------------------------------------------------
  // Reusable dropdown menu item component
  const MenuItem = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700"
    >
      <Icon size={16} />
      {label}
    </button>
  );

  // ------------------------------------------------------------------------
  // NAVIGATION CONFIGURATION
  // ------------------------------------------------------------------------
  // Parent role navigation items (displayed in horizontal nav bar on desktop)
  const navItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Attendance", icon: CheckCircle2, path: "/attendance" },
    { name: "Photos", icon: Image, path: "/photos" },
    { name: "Account", icon: User, path: "/account" },
  ];

  // Coach role navigation items (displayed in horizontal nav bar on desktop)
  const navItemscoach = [
    { name: "Home", icon: Home, path: "/coachdashboard" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Check-In", icon: User, path: "/checkIn" },
    { name: "Attendance", icon: CheckCircle2, path: "/attendance" },
    { name: "Photos", icon: Image, path: "/Gallery" },
  ];

  // Admin role navigation items (for mobile bottom nav only)
  // Desktop admin uses sidebar navigation in AdminLayout
  const navItemsadmin = [
    { name: "Home", icon: Home, path: "/admin" },
    { name: "Account", icon: Settings, path: "/company-settings" },
    { name: "Clients", icon: Users, path: "/clients" },
    { name: "Classes", icon: GraduationCap, path: "/classes" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Finance", icon: Wallet, path: "/financials" },
    { name: "Register", icon: Person, path: "/registerchild" },
    { name: "Communication", icon: MessageCircle, path: "/communication" },
  ];

  // Select appropriate navigation items based on user role
  const itemsToShow =
    role === "coach"
      ? navItemscoach
      : role === "admin"
      ? navItemsadmin
      : navItems;

  // ------------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------------
  return (
    <header className="w-full py-1 flex justify-between max-sm:items-center max-sm:px-3 mb-[15px] mt-6">
      <div className="w-full ml-1 max-sm:mx-auto flex items-center justify-between max-sm:justify-between">
        {/* ================================================================ */}
        {/* LOGO SECTION */}
        {/* Displays company logo on the left side of header */}
        {/* ================================================================ */}
        <div className="flex w-fluid-avatar-lg h-fluid-avatar-lg items-center max-sm:mx-auto max-sm:justify-start">
          <Logo />
        </div>

        {/* ================================================================ */}
        {/* MOBILE HEADER (visible on small screens only) */}
        {/* Shows: Hamburger menu button, centered logo, profile image */}
        {/* Hamburger opens AdminSidebar for admin users */}
        {/* ================================================================ */}
        <div className="md:hidden flex items-center justify-between w-full">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 bg-white rounded-md shadow"
            aria-label="Open admin menu"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <img
            src="/images/logo3.png"
            alt="Outline"
            className="size-[80px] object-contain mix-blend-exclusion mx-2"
          />
          <div className="md:hidden flex items-center gap-2 cursor-pointer max-sm:justify-end max-sm:items-end ">
            <img
              onClick={() => {
                navigate("/settings");
              }}
              src={logo}
              alt="profile"
              className="w-fluid-avatar-lg h-fluid-avatar-lg rounded-full object-cover"
            />
          </div>
        </div>

        {/* ================================================================ */}
        {/* PARENT NAVIGATION BAR (desktop only) */}
        {/* Horizontal navigation bar with Dashboard, Calendar, Attendance, Photos, Badges */}
        {/* Only visible for parent role users on desktop screens */}
        {/* ================================================================ */}
        {role === "parent" && (
          <nav>
            <ul className="flex items-center max-sm:hidden font-manrope text-base font-medium bg-[#FFFFFF66] rounded-fluid-3xl shadow p-1 gap-1">
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Calendar
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/attendance"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Attendance
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/photos"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Photos
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/badges"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Badges
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        {/* ================================================================ */}
        {/* COACH NAVIGATION BAR (desktop only) */}
        {/* Horizontal navigation bar with Dashboard, Calendar, Check-In, Attendance, Photos */}
        {/* Only visible for coach role users on desktop screens */}
        {/* ================================================================ */}
        {role === "coach" && (
          <nav>
            <ul className="flex items-center max-sm:hidden font-manrope text-base font-medium bg-[#FFFFFF66] rounded-fluid-3xl shadow p-1 gap-1">
              <li>
                <NavLink
                  to="/coachdashboard"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Calendar
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/checkIn"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Check-In
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/attendance"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Attendance
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/Gallery"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Photos
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        {/* ================================================================ */}
        {/* DESKTOP PROFILE SECTION */}
        {/* Parent/Coach: Profile image redirects to settings (no dropdown) */}
        {/* Admin: Profile image with dropdown menu for additional options */}
        {/* ================================================================ */}
        <div className="hidden md:flex items-center gap-3 mr-12 relative">
          <div className="flex items-center gap-3" ref={dropdownRef}>
            {/* Profile image - clickable for all roles */}
            <img
              onClick={() => {
                if (role === "admin") {
                  setOpen(!open);  // Toggle dropdown for admin
                } else {
                  navigate("/settings");  // Direct navigation for parent/coach
                }
              }}
              src={logo}
              alt="profile"
              className="w-fluid-avatar-sm h-fluid-avatar-sm rounded-full object-cover cursor-pointer"
            />

            {/* User name and role display */}
            <div className="leading-tight max-sm:hidden text-end">
              <p className="text-[#173151] font-manrope font-medium text-fluid-md leading-[140%] tracking-[-0.02em] capitalize">
                {user?.first_name} {user?.last_name?.charAt(0)}.
              </p>
              <p className="text-[#6f6f6f] text-sm font-manrope font-medium leading-[155%] capitalize">
                {user?.role || "User"}
              </p>
            </div>

            {/* Dropdown indicator (chevron) - visible for admin role */}
            <div className="flex items-center justify-center cursor-pointer ml-3" onClick={() => setOpen(!open)}>
              <ChevronDown
                size={25}
                className={`${
                  open ? "rotate-180" : ""
                } transition-transform duration-200 text-[#173151]`}
                strokeWidth={3}
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* ADMIN DROPDOWN MENU */}
          {/* Displays menu options for admin users when dropdown is open */}
          {/* Menu items: Profile, Payment & Billing, Contact, Add Child, Password, Log out */}
          {/* ================================================================ */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl rounded-xl border p-2 z-50">
            <MenuItem
              icon={User}
              label="Profile"
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
            />
            <MenuItem
              icon={CreditCard}
              label="Payment & Billing"
              onClick={() => {
                setOpen(false);
                navigate("/paymentbilling");
              }}
            />
            <MenuItem
              icon={Phone}
              label="Contact"
              onClick={() => {
                setOpen(false);
                navigate("/contactus");
              }}
            />
            <MenuItem
              icon={UserPlus}
              label="Add Child"
              onClick={() => {
                setOpen(false);
                navigate("/registerchild");
              }}
            />
            <MenuItem
              icon={Lock}
              label="Password"
              onClick={() => {
                setOpen(false);
                // TODO: Implement password change modal
              }}
            />
            <MenuItem
              icon={LogOut}
              label="Log out"
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate("/login");
              }}
            />
          </div>
        )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* Sticky bottom navigation bar displayed on mobile for all roles */}
      {/* Shows navigation icons based on user role (parent/coach/admin) */}
      {/* ==================================================================== */}
      <div className="fixed bottom-0  w-full left-0 right-0 bg-[#0D1B2A] py-3 px-6 flex justify-between items-center sm:hidden z-10">
        {itemsToShow.map((item) => {
          const Icon = item.icon;
          const hideLabel = role === "admin";

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition ${
                  isActive ? "text-[#F3BC48]" : "text-gray-300"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={24}
                    className={`${
                      isActive ? "text-[#F3BC48]" : "text-gray-300"
                    }`}
                  />

                  {!hideLabel && (
                    <span
                      className={`text-xs ${
                        isActive
                          ? "text-[#F3BC48] font-medium"
                          : "text-gray-300"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Bottom navigation indicator bar */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-gray-400 opacity-60" />
      </div>

      {/* ==================================================================== */}
      {/* MOBILE SIDEBAR OVERLAY (Admin only) */}
      {/* Full-screen sidebar overlay with AdminSidebar component */}
      {/* Opens when hamburger menu is clicked on mobile */}
      {/* ==================================================================== */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-full h-full bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-start mb-4">
              <button
                aria-label="Close sidebar"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md bg-white shadow"
              >
                <X size={20} />
              </button>
            </div>
            <AdminSidebar
              collapsed={false}
              setCollapsed={() => {}}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
