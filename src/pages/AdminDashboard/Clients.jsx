import React, { useState, useEffect } from "react";
import ClientsHeader from "../../components/Clients/ClientsHeader";
import ClientsTabs from "../../components/Clients/ClientsTabs";
import AccountTable from "../../components/Clients/AccountTable";
import MembersTable from "../../components/Clients/MembersTable";
import Header from "../../components/Header";
import adminService from "../../api/services/admin.service";
import enrollmentsService from "../../api/services/enrollments.service";
import toast from "react-hot-toast";

export default function Clients() {
  const [activeTab, setActiveTab] = useState("account");
  const [accounts, setAccounts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pagination, setPagination] = useState({ total: 0, skip: 0, limit: 50 });

  useEffect(() => {
    fetchClients();
    fetchMembers();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await adminService.getClients({ skip: 0, limit: 100 });

      // Transform API data to match AccountTable expected format
      const transformedAccounts = (response.items || []).map(client => {
        // Split full_name into firstName and lastName
        const nameParts = (client.full_name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        return {
          id: client.id,
          firstName,
          lastName,
          email: client.email || "",
          phone: client.phone || "N/A",
          status: client.active_enrollments > 0 ? "Active" : "Inactive",
          class: client.active_enrollments > 0 ? `${client.active_enrollments} enrollment(s)` : "None",
          reg_date: client.created_at,
          balance: "0.00",
          childrenCount: client.children_count || 0,
        };
      });

      setAccounts(transformedAccounts);
      setPagination({
        total: response.total || transformedAccounts.length,
        skip: response.skip || 0,
        limit: response.limit || 50,
      });
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      // Fetch enrollments which include child and class info
      const response = await enrollmentsService.getAll({ limit: 100 });

      // Transform enrollments to members format
      const transformedMembers = (response.items || response || []).map(enrollment => ({
        id: enrollment.id,
        accountId: enrollment.user_id || enrollment.parent_id,
        firstName: enrollment.child_first_name || enrollment.child?.first_name || "",
        lastName: enrollment.child_last_name || enrollment.child?.last_name || "",
        dob: enrollment.child_dob || enrollment.child?.date_of_birth || "",
        shoeSize: enrollment.child?.shoe_size || "N/A",
        jerseySize: enrollment.child?.shirt_size || "N/A",
        coach: enrollment.coach_name || "TBD",
        lastCheckIn: enrollment.last_check_in || "N/A",
        badges: enrollment.badges || [],
        email: enrollment.parent_email || enrollment.user_email || "",
        phone: enrollment.parent_phone || "",
        status: enrollment.status === "active" ? "Active" :
                enrollment.status === "pending" ? "Pending" : "Inactive",
        class: enrollment.class_name || enrollment.class?.name || "N/A",
        reg_date: enrollment.created_at || enrollment.enrolled_at,
      }));

      setMembers(transformedMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      // Don't show error toast for members if it fails - accounts is primary
    }
  };

  // Filter based on search query
  const filteredAccounts = accounts.filter((a) =>
    `${a.firstName} ${a.lastName} ${a.email}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName} ${m.coach} ${m.class}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7]">
        <Header />
        <div className="max-w-9xl sm:px-6 px-3 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btn-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
      <div className="max-w-9xl sm:px-6 px-3 py-8 max-sm:py-2">
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
