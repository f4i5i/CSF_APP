/**
 * Clients Management Page
 * Admin page for managing client accounts (parents)
 */

import React, { useState, useEffect, useCallback } from "react";
import { Trash2, Mail, Phone, Users, Eye } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import Header from "../../components/Header";
import adminService from "../../api/services/admin.service";
import toast from "react-hot-toast";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;

      const params = {
        skip,
        limit: itemsPerPage,
      };

      if (searchQuery) params.search = searchQuery;

      const response = await adminService.getClients(params);

      // Transform API data
      let clientsData = (response.items || []).map(client => {
        const nameParts = (client.full_name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        return {
          id: client.id,
          first_name: firstName,
          last_name: lastName,
          email: client.email || "",
          phone: client.phone || "",
          is_active: client.active_enrollments > 0,
          active_enrollments: client.active_enrollments || 0,
          children_count: client.children_count || 0,
          created_at: client.created_at,
        };
      });

      // Filter by status on frontend if needed
      if (statusFilter !== "") {
        const isActive = statusFilter === "true";
        clientsData = clientsData.filter((c) => c.is_active === isActive);
      }

      setClients(clientsData);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to load clients");
      setClients([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleViewClient = (clientData) => {
    // TODO: Navigate to client detail page or open modal
    toast.success(`Viewing client: ${clientData.first_name} ${clientData.last_name}`);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await adminService.deleteClient(clientId);
      toast.success("Client deleted successfully");
      fetchClients();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to delete client:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete client";
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "name",
      label: "Client",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#173151] flex items-center justify-center text-white font-semibold text-sm">
            {row.first_name?.[0]?.toUpperCase()}{row.last_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold font-manrope text-text-primary">
              {row.first_name} {row.last_name}
            </p>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Mail className="w-3 h-3" />
              <span>{row.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => (
        <div className="flex items-center gap-1 text-sm font-manrope text-text-muted">
          {value ? (
            <>
              <Phone className="w-4 h-4" />
              <span>{value}</span>
            </>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: "children_count",
      label: "Children",
      render: (value) => (
        <div className="flex items-center gap-1 text-sm font-manrope text-text-muted">
          <Users className="w-4 h-4" />
          <span>{value || 0}</span>
        </div>
      ),
    },
    {
      key: "active_enrollments",
      label: "Enrollments",
      render: (value) => (
        <span className="text-sm font-manrope text-text-primary font-semibold">
          {value || 0}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      type: "status",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value
              ? "bg-[#DFF5E8] text-status-success"
              : "bg-neutral-lightest text-neutral-dark"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-manrope text-text-muted">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "right",
      actions: (row) => [
        {
          label: "View",
          icon: Eye,
          onClick: () => handleViewClient(row),
        },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: "Delete Client",
              message: `Are you sure you want to delete "${row.first_name} ${row.last_name}"? This action cannot be undone.`,
              action: () => handleDeleteClient(row.id),
            });
          },
        },
      ],
    },
  ];

  const filters = [
    {
      type: "select",
      placeholder: "All Statuses",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "", label: "All Statuses" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  const hasActiveFilters = statusFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="h-full">
      <Header />

      <div className="max-w-9xl mx-auto sm:px-4 px-0">
        <div className="mb-8 flex lg:flex-row flex-col lg:items-center items-start lg:gap-0 gap-4 justify-between">
          <div>
            <h1 className="lg:text-[46px] text-[20px] md:text-[30px] font-bold text-text-primary font-kollektif">
              Clients Management
            </h1>
            <p className="text-neutral-main font-manrope mt-1">
              Manage client accounts and their enrollments
            </p>
          </div>
        </div>

        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by name or email..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <DataTable
          columns={columns}
          data={clients}
          loading={loading}
          emptyMessage="No clients found"
          pagination={true}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
      />
    </div>
  );
}
