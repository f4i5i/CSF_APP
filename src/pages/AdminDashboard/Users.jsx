/**
 * Users Management Page
 * Admin page for managing users with role-based access control
 */

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Mail, Phone, Shield } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import UserFormModal from "../../components/admin/UserFormModal";
import usersService from "../../api/services/users.service";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import Header from "../../components/Header";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "coach", label: "Coach" },
  { value: "parent", label: "Parent" },
];

const ROLE_COLORS = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  coach: "bg-green-100 text-green-800",
  parent: "bg-gray-100 text-gray-800",
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.role === "owner";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;

      const params = {
        skip,
        limit: itemsPerPage,
      };

      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== "") params.is_active = statusFilter === "true";
      if (searchQuery) params.search = searchQuery;

      const response = await usersService.getAll(params);

      setUsers(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
      setUsers([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = () => {
    setModalMode("create");
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (userData) => {
    setModalMode("edit");
    setSelectedUser(userData);
    setModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await usersService.delete(userId);
      toast.success("User deleted successfully");
      fetchUsers();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to delete user:", error);
      const errorMessage = error.message || "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
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
      label: "User",
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
      key: "role",
      label: "Role",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-text-muted" />
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
              ROLE_COLORS[value] || ROLE_COLORS.parent
            }`}
          >
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "is_verified",
      label: "Verified",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value ? "Verified" : "Pending"}
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
      actions: (row) => {
        // Check if current user can manage this user
        const targetIsOwner = row.role === "owner";
        const targetIsAdmin = row.role === "admin";
        const isSelf = row.id === currentUser?.id;

        // Admin cannot edit/delete owner or admin accounts
        // Owner can edit/delete anyone except themselves
        const canEdit = isOwner ? !isSelf : !targetIsOwner && !targetIsAdmin;
        const canDelete = isOwner ? !isSelf : !targetIsOwner && !targetIsAdmin && !isSelf;

        const actions = [];

        if (canEdit) {
          actions.push({
            label: "Edit",
            icon: Edit,
            onClick: () => handleEditUser(row),
          });
        }

        if (canDelete) {
          actions.push({
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            onClick: () => {
              setConfirmDialog({
                isOpen: true,
                title: "Delete User",
                message: `Are you sure you want to delete "${row.first_name} ${row.last_name}"? This will deactivate their account.`,
                action: () => handleDeleteUser(row.id),
              });
            },
          });
        }

        return actions;
      },
    },
  ];

  const filters = [
    {
      type: "select",
      placeholder: "All Roles",
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { value: "", label: "All Roles" },
        ...ROLES.map((role) => ({
          value: role.value,
          label: role.label,
        })),
      ],
    },
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

  const hasActiveFilters = roleFilter || statusFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />

      <div className="max-w-9xl mx-auto px-3 sm:px-4 py-4 flex-1 flex flex-col min-h-0 w-full">
        <div className="shrink-0 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center items-start gap-3 sm:gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[30px] lg:text-[46px] font-bold text-text-primary font-kollektif truncate">
              Users Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-main font-manrope mt-1 hidden sm:block">
              Create and manage user accounts with role-based access
            </p>
          </div>

          <button
            onClick={handleCreateUser}
            className="flex items-center gap-1.5 sm:gap-2 font-manrope bg-btn-gold text-text-body px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Create </span>User
          </button>
        </div>

        <div className="shrink-0">
          <FilterBar
            searchValue={searchQuery}
            searchPlaceholder="Search by name or email..."
            onSearch={setSearchQuery}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col pb-2">
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage="No users found"
            pagination={true}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <UserFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        initialData={selectedUser}
        onSuccess={handleModalSuccess}
      />

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
