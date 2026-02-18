import React, { useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, BookOpen, Users, UserCog, Calendar, DollarSign, FileText, BarChart3, ChevronRight, ChevronDown, PanelRightOpen, PanelLeftOpen, LogOut, ClipboardList, Layers, MapPin, School, RotateCcw, CalendarDays, Award, Image, XCircle, Settings, Bell, Shield, Tag, Mail } from "lucide-react";
import { useAuth } from "../../context/auth";
import { usePermissions } from "../../hooks/usePermissions";

// Categorized navigation structure with permissions
const categorizedRoutes = [
  { name: "Home", to: "/admin", icon: Home, end: true },
  {
    category: "Setup",
    icon: Settings,
    items: [
      { name: "Programs", to: "/admin/programs", icon: Layers, permission: "canManagePrograms" },
      { name: "Areas", to: "/admin/areas", icon: MapPin, permission: "canManageAreas" },
      { name: "Sites", to: "/admin/schools", icon: School, permission: "canManageSchools" },
    ]
  },
  {
    category: "Classes",
    icon: BookOpen,
    items: [
      { name: "Classes", to: "/admin/classes", icon: BookOpen, permission: "canManageClasses" },
      { name: "Enrollments", to: "/admin/enrollments", icon: ClipboardList, permission: "canManageClasses" },
    ]
  },
  {
    category: "People",
    icon: Users,
    items: [
      { name: "Users", to: "/admin/users", icon: UserCog, permission: "canManageUsers" },
      { name: "Clients", to: "/clients", icon: Users, permission: "canViewAllClients" },
    ]
  },
  {
    category: "Documents",
    icon: FileText,
    items: [
      { name: "Waivers", to: "/admin/waivers", icon: FileText, permission: "canManageWaivers" },
      { name: "Waiver Reports", to: "/admin/waiver-reports", icon: BarChart3, permission: "canViewReports" },
    ]
  },
  {
    category: "Finance",
    icon: DollarSign,
    minRole: "OWNER", // Only Owner can access finance section
    items: [
      { name: "Financials", to: "/financials", icon: DollarSign, permission: "canViewFinancials" },
      { name: "Refunds", to: "/admin/refunds", icon: RotateCcw, permission: "canProcessRefunds" },
      { name: "Cancellations", to: "/admin/cancellations", icon: XCircle, permission: "canManageFinancials" },
      { name: "Discounts", to: "/admin/discounts", icon: Tag, permission: "canManageFinancials" },
    ]
  },
  {
    category: "Media",
    icon: Image,
    items: [
      { name: "Mass Email", to: "/admin/mass-email", icon: Mail },
      { name: "Announcements", to: "/admin/announcements", icon: Bell },
      { name: "Calendar", to: "/admin/calendar", icon: Calendar },
      { name: "Events", to: "/admin/events", icon: CalendarDays },
      { name: "Badges", to: "/admin/badges", icon: Award, permission: "canManageBadges" },
      { name: "Photos", to: "/admin/photos", icon: Image },
    ]
  },
  {
    category: "System",
    icon: Shield,
    minRole: "OWNER", // Only visible to Owner
    items: [
      { name: "Settings", to: "/admin/settings", icon: Settings, permission: "canManageSystemSettings" },
    ]
  },
];

export default function AdminSidebar({ collapsed, setCollapsed, onNavigate }) {
  const { logout } = useAuth();
  const { can, isAtLeast, roleLabel, isOwner } = usePermissions();
  const [expandedCategories, setExpandedCategories] = useState({
    Setup: false,
    Classes: false,
    People: false,
    Documents: false,
    Finance: false,
    Media: false,
    System: false,
  });

  const navigate = useNavigate();

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter routes based on permissions
  const filteredRoutes = useMemo(() => {
    return categorizedRoutes
      .filter(item => {
        // Check if category has a minimum role requirement
        if (item.minRole && !isAtLeast(item.minRole)) {
          return false;
        }
        return true;
      })
      .map(item => {
        // If it's a category with items, filter the items
        if (item.items) {
          const filteredItems = item.items.filter(subItem => {
            // If no permission required, show item
            if (!subItem.permission) return true;
            // Check if user has the required permission
            return can(subItem.permission);
          });

          // Only return category if it has visible items
          if (filteredItems.length === 0) return null;

          return { ...item, items: filteredItems };
        }
        return item;
      })
      .filter(Boolean); // Remove null entries
  }, [can, isAtLeast]);
  return (
    <div
      className={`flex flex-col h-full  border border-border-light  bg-gradient-to-b from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8] shadow transition-all ${
        collapsed ? "w-20" : "sm:w-64 w-full"
      } `}
    >
      {/* Top: logo and toggle */}
      <div className="md:flex items-center justify-between px-4 py-3  hidden">
        <div className="flex items-center justify-center gap-2">
          <div
            className={` flex justify-center items-center relative cursor-pointer ${
              collapsed ? "w-0 h-0" : "w-24 h-24"
            }`}
            onClick={() => {
              if (onNavigate) onNavigate();
              navigate("/admin");
            }}
          >
            {/* Logo Outline (turns black using blend mode) */}
            <img
              src="/images/logo.png"
              alt="Outline"
              className="w-[95px] h-[90px] md:block hidden object-contain
          mix-blend-exclusion"
            />
          </div>
        </div>
        <button
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          onClick={() => setCollapsed(!collapsed)}
          className="p-2  rounded-md hover:bg-gray-100"
        >
          {collapsed ? (
            <PanelRightOpen size={20} />
          ) : (
            <PanelLeftOpen size={20} />
          )}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isOwner
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <Shield size={12} />
            <span>{roleLabel}</span>
          </div>
        </div>
      )}

      <hr className="w-full border border-border-light" />
      {/* Links */}
      <nav className=" px-1 py-3 overflow-auto bg-[#ffffff80] rounded-xl mx-3 mt-[2rem]">
        {filteredRoutes.map((item, index) => {
          // Standalone route (like Home)
          if (item.to) {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 my-1 rounded-md transition-colors group ${
                    isActive
                      ? "bg-[#F3BC48]/20 text-[#173151] font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={() => {
                  if (onNavigate) onNavigate();
                }}
              >
                <div className="flex items-center justify-center w-8">
                  <Icon size={18} />
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate font-manrope">{item.name}</span>
                    <ChevronRight size={16} className="text-gray-700" />
                  </>
                )}
              </NavLink>
            );
          }

          // Category with items
          const CategoryIcon = item.icon;
          const isExpanded = expandedCategories[item.category];

          return (
            <div key={item.category} className="mb-1">
              {/* Category Header */}
              <button
                onClick={() => !collapsed && toggleCategory(item.category)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  collapsed ? "justify-center" : ""
                } text-gray-600 hover:bg-gray-100`}
              >
                <div className="flex items-center justify-center w-8">
                  <CategoryIcon size={18} />
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider font-manrope">
                      {item.category}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {/* Category Items */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  collapsed || isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {item.items.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink
                      key={subItem.to}
                      to={subItem.to}
                      end={subItem.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 my-0.5 rounded-md transition-colors group ${
                          collapsed ? "" : "ml-4"
                        } ${
                          isActive
                            ? "bg-[#F3BC48]/20 text-[#173151] font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                      onClick={() => {
                        if (onNavigate) onNavigate();
                      }}
                    >
                      <div className="flex items-center justify-center w-8">
                        <SubIcon size={16} />
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate font-manrope text-sm">{subItem.name}</span>
                          <ChevronRight size={14} className="text-gray-500" />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="flex-1" />
      <button
        className="w-full flex items-center justify-start gap-3 px-3 py-2 ml-[12px] mb-[20px] rounded-md text-sm text-gray-700 hover:bg-gray-100"
        onClick={async () => {
          await logout();
          navigate("/login");
        }}
      >
        <LogOut size={16} className=" text-error-dark font-semibold " />
        {!collapsed && (
          <span className="font-manrope font-semibold">Logout</span>
        )}
      </button>

      {/* Bottom: profile */}
    </div>
  );
}
