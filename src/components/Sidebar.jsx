import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

const items = [
  { label: "My Account", path: "/settings" },
  { label: "Payment & Billing", path: "/paymentbilling" },
  { label: "Password", path: "/settings/password" },
  { label: "Badges", path: "/badges" },
  { label: "Contact", path: "/contactus" },
  { label: "Log out", isLogout: true },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigate = async (item) => {
    if (item.isLogout) {
      await logout();
      navigate('/login');
    } else if (item.path) {
      navigate(item.path);
    }
  };

  // ✅ find which route is active
 const currentItem =
  items.find(
    (item) =>
      item.label !== "Log out" && location.pathname.includes(item.path)
  ) || items[0];

  return (
    <>
      {/* ✅ MOBILE DROPDOWN */}
      <div className="sm:hidden w-full px-4  mt-5 mx-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center bg-[#F6F8FA] border border-[#DFE1E7] rounded-lg px-4 py-3 text-sm font-medium shadow"
        >
          {currentItem.label}
          <ChevronDown
            className={`h-4 transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="mt-2  bg-[#F6F8FA] border rounded-lg shadow overflow-hidden">
            {items.map((item, i) => (
              <button
                key={i}
               className={`w-full text-left px-4 py-3 text-sm
  ${
    item.label === "Log out"
      ? "text-red-500" // 🔴 always red
      : location.pathname.includes(item.path)
      ? "bg-[#F6F8FA] font-medium border-[1px] border-[#DFE1E7]"
      : "text-gray-600"
  }`}
                onClick={() => {
                  setOpen(false);
                  handleNavigate(item);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ DESKTOP SIDEBAR */}
      <div className="hidden sm:block w-full lg:w-60 border-r p-6 space-y-4">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => handleNavigate(item)}
           className={`text-left w-full py-2 px-3 rounded-lg text-sm
  ${
    item.label === "Log out"
      ? "text-red-500" // 🔴 always red
      : location.pathname.includes(item.path)
      ? "bg-[#F6F8FA] font-medium border-[1px] border-[#DFE1E7]"
      : "text-gray-600"
  }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
