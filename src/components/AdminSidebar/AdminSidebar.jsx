import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, BookOpen, Users, Calendar, DollarSign, FileText, BarChart3, ChevronRight, PanelRightOpen, PanelLeftOpen, LogOut } from "lucide-react";
import baseLogo from "../../assets/logo.png";
import crown from "../../assets/Carolina.png";
import logo from "../../assets/person.png";
import { useAuth } from "../../context/auth";
const routes = [
  { name: "Home", to: "/admin", icon: Home, end: true },
  { name: "Classes Management", to: "/admin/classes", icon: BookOpen },
  { name: "Waivers", to: "/admin/waivers", icon: FileText },
  { name: "Waiver Reports", to: "/admin/waiver-reports", icon: BarChart3 },
  { name: "Clients", to: "/clients", icon: Users },
  { name: "Calender", to: "/calendar", icon: Calendar },
  { name: "Financials", to: "/financials", icon: DollarSign },
];

export default function AdminSidebar({ collapsed, setCollapsed, onNavigate }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
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
              collapsed ? "w-0 h-0" : "w-16 h-16 "
            }`}
            onClick={() => {
              if (onNavigate) onNavigate();
              navigate("/admin");
            }}
          >
            {/* Logo Outline (turns black using blend mode) */}
            <img
              src="/images/logo3.png"
              alt="Outline"
              className="w-[54px] h-[50px] md:block hidden  object-contain 
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
      <hr className="w-full border border-border-light" />

      <div className="px-3 py-4 border-t">
        <button
          className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100"
          onClick={() => {
            if (onNavigate) onNavigate();
            navigate("/account");
          }}
        >
          <img
            src={logo}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover"
          />
          {!collapsed && (
            <div className="text-left">
              <div className="text-sm font-medium font-manrope">Admin User</div>
              <div className="text-xs text-gray-500 font-manrope">
                Administrator
              </div>
            </div>
          )}
        </button>
      </div>
      <hr className="w-full border border-border-light" />
      {/* Links */}
      <nav className=" px-1 py-3 overflow-auto bg-[#ffffff80] rounded-xl mx-3 mt-[2rem]">
        {routes.map((r) => {
          const Icon = r.icon;
          return (
            <NavLink
              key={r.to}
              to={r.to}
              end={r.end}
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
                  <span className="flex-1 truncate font-manrope">{r.name}</span>
                  <ChevronRight size={16} className="text-gray-700" />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <button
        className="w-full flex items-end justify-start  gap-3 px-3 py-2 ml-[12px] mb-[20px] rounded-md text-sm text-gray-700 flex-1 "
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
