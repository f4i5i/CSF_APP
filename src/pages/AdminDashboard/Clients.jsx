import React, { useState } from "react";
import ClientsHeader from "../../components/Clients/ClientsHeader";
import ClientsTabs from "../../components/Clients/ClientsTabs";
import AccountTable from "../../components/Clients/AccountTable";
import MembersTable from "../../components/Clients/MembersTable";
import Header from "../../components/Header";

const mockAccounts = [
  {
    id: "A001",
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.garcia@email.com",
    phone: "(555) 123-4567",
    status: "Active",
    class: "Soccer",
    reg_date: "2015-04-10",
    balance: "$50",
    childrenCount: 2,
  },
  {
    id: "A002",
    firstName: "Jon",
    lastName: "Doe",
    email: "jon.doe@email.com",
    phone: "(555) 222-3344",
    status: "Inactive",
    class: "Soccer",
    reg_date: "2015-04-10",
    balance: "$50",
    childrenCount: 0,
  },
  {
    id: "A003",
    firstName: "Hannah",
    lastName: "Smith",
    email: "hannah.smith@email.com",
    phone: "(555) 777-8899",
    status: "Active",
    class: "Soccer",
    reg_date: "2015-04-10",
    balance: "$50",
    childrenCount: 1,
  },
];

const mockMembers = [
  {
    id: "M100",
    accountId: "A001",
    firstName: "Robert",
    lastName: "Johnson",
    dob: "2015-04-10",
    shoeSize: 2,
    jerseySize: "S",
    coach: "Coach Martinez",
    lastCheckIn: "2025-11-21",
    badges: ["Perfect Attendance"],
    email: "hannah.smith@email.com",
    phone: "(555) 777-8899",
    status: "Active",
    class: "Soccer",
    reg_date: "2015-04-10",
  },
  {
    id: "M101",
    accountId: "A003",
    firstName: "Leah",
    lastName: "Brown",
    dob: "2013-09-02",
    shoeSize: 4,
    jerseySize: "M",
    coach: "Coach Lee",
    lastCheckIn: "2025-11-22",
    email: "hannah.smith@email.com",
    phone: "(555) 777-8899",
    status: "Active",
    class: "Soccer",
    reg_date: "2015-04-10",
    badges: [],
  },
];

export default function Clients() {
  const [activeTab, setActiveTab] = useState("account");
  const [accounts] = useState(mockAccounts);
  const [members] = useState(mockMembers);
  const [query, setQuery] = useState("");

  // simple filter; you can extend with complex filters
  const filteredAccounts = accounts.filter((a) =>
    `${a.firstName} ${a.lastName} ${a.email}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName} ${m.coach}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
      <div
        className="max-w-9xl sm:px-6 px-3 py-8 max-sm:py-2 rounded-lg border border-border-light  bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]"
        style={{ boxShadow: "0 5px 20px 0 rgb(0 0 0 / 0.05)" }}
      >
        {" "}
        <ClientsHeader
          title="Clients"
          description="Manage accounts and members — search, export, and communicate."
          query={query}
          setQuery={setQuery}
        />
        <ClientsTabs active={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === "account" ? (
            <AccountTable data={filteredAccounts} allData={accounts} />
          ) : (
            <MembersTable data={filteredMembers} allData={members} />
          )}
        </div>
      </div>
    </div>
  );
}
