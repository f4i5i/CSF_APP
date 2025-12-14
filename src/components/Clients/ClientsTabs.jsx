import React from "react";

export default function ClientsTabs({ active, onChange }) {
  return (
    <div className="mt-6 bg-white/60 rounded-2xl p-3 shadow-sm border border-gray-100">
      <div className="flex gap-2 overflow-x-auto font-manrope">
        <TabButton active={active === "account"} onClick={() => onChange("account")}>
          Account
        </TabButton>
        <TabButton active={active === "members"} onClick={() => onChange("members")}>
          Members
        </TabButton>
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full transition font-manrope text-sm font-medium ${
        active ? "bg-[#173151] text-white shadow" : "bg-white text-[#173151] border border-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
