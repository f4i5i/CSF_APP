import React, { useState, useEffect, useCallback } from "react";
import { Tag, Plus, Loader2, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import DiscountForm from "../../components/admin/DiscountForm";
import Header from "../../components/Header";
import discountsService from "../../api/services/discounts.service";
import toast from "react-hot-toast";

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter === "active") params.is_active = true;
      if (statusFilter === "inactive") params.is_active = false;

      const response = await discountsService.getAll(params);
      let items = response.items || response || [];

      // Client-side filters
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter(
          (d) =>
            d.code?.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q)
        );
      }
      if (typeFilter) {
        items = items.filter((d) => d.discount_type === typeFilter);
      }

      setDiscounts(items);
    } catch (error) {
      console.error("Failed to fetch discounts:", error);
      toast.error("Failed to load discount codes");
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, typeFilter]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // Fetch programs and classes for the form dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [programsRes, classesRes] = await Promise.allSettled([
          import("../../api/services/programs.service").then((m) => m.default.getAll()),
          import("../../api/services/classes.service").then((m) => m.default.getAll()),
        ]);
        if (programsRes.status === "fulfilled") {
          setPrograms(programsRes.value?.items || programsRes.value || []);
        }
        if (classesRes.status === "fulfilled") {
          setClasses(classesRes.value?.items || classesRes.value || []);
        }
      } catch {
        // Silently fail - dropdowns will just be empty
      }
    };
    fetchOptions();
  }, []);

  const handleToggleActive = async (discount) => {
    try {
      await discountsService.update(discount.id, { is_active: !discount.is_active });
      toast.success(`Discount ${discount.is_active ? "deactivated" : "activated"}`);
      fetchDiscounts();
    } catch (error) {
      console.error("Failed to toggle discount:", error);
      toast.error("Failed to update discount status");
    }
  };

  const handleDelete = async (discountId) => {
    try {
      await discountsService.delete(discountId);
      toast.success("Discount code deleted");
      fetchDiscounts();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to delete discount:", error);
      toast.error(error.response?.data?.detail || "Failed to delete discount");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatus = (discount) => {
    if (!discount.is_active) return { label: "Inactive", color: "bg-gray-100 text-gray-600" };
    if (discount.valid_until && new Date(discount.valid_until) < new Date()) {
      return { label: "Expired", color: "bg-red-100 text-red-700" };
    }
    if (discount.max_uses && discount.current_uses >= discount.max_uses) {
      return { label: "Used Up", color: "bg-orange-100 text-orange-700" };
    }
    return { label: "Active", color: "bg-green-100 text-green-700" };
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-mono font-bold text-text-primary text-sm">{value}</span>
          {row.description && (
            <p className="text-xs text-text-muted font-manrope mt-0.5 truncate max-w-[200px]">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "discount_type",
      label: "Discount",
      render: (value, row) => (
        <div>
          <span className="text-sm font-semibold font-manrope text-text-primary">
            {value === "percentage"
              ? `${Number(row.discount_value)}%`
              : `$${Number(row.discount_value).toFixed(2)}`}
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {row.duration && row.duration !== "once" && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                {row.duration === "forever" ? "Forever" : `${row.duration_in_months}mo`}
              </span>
            )}
            {row.first_time_only && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                1st time
              </span>
            )}
            {row.restricted_to_user_ids?.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                {row.restricted_to_user_ids.length} parent{row.restricted_to_user_ids.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "valid_from",
      label: "Validity",
      render: (value, row) => (
        <div className="text-xs font-manrope text-text-muted">
          <div>{formatDate(value)}</div>
          <div>to {row.valid_until ? formatDate(row.valid_until) : "No expiry"}</div>
        </div>
      ),
    },
    {
      key: "current_uses",
      label: "Uses",
      render: (value, row) => (
        <span className="text-sm font-manrope text-text-muted">
          {value || 0}{row.max_uses ? ` / ${row.max_uses}` : ""}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (_, row) => {
        const status = getStatus(row);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "right",
      actions: (row) => [
        {
          label: "Edit",
          icon: Pencil,
          onClick: () => setFormModal({ isOpen: true, mode: "edit", initialData: row }),
        },
        {
          label: row.is_active ? "Deactivate" : "Activate",
          icon: row.is_active ? ToggleLeft : ToggleRight,
          onClick: () => handleToggleActive(row),
        },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: () =>
            setConfirmDialog({
              isOpen: true,
              title: "Delete Discount Code",
              message: `Are you sure you want to delete "${row.code}"? This action cannot be undone.`,
              action: () => handleDelete(row.id),
            }),
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
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      type: "select",
      placeholder: "All Types",
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: "", label: "All Types" },
        { value: "percentage", label: "Percentage" },
        { value: "fixed_amount", label: "Fixed Amount" },
      ],
    },
  ];

  const hasActiveFilters = statusFilter || typeFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />

      <div className="max-w-9xl mx-auto px-3 sm:px-4 py-4 flex-1 flex flex-col min-h-0 w-full">
        <div className="shrink-0 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center items-start gap-3 sm:gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[30px] lg:text-[46px] font-bold text-text-primary font-kollektif truncate flex items-center gap-3">
              <Tag className="w-8 h-8 text-btn-gold shrink-0 hidden sm:block" />
              Discount Codes
            </h1>
            <p className="text-xs sm:text-sm text-neutral-main font-manrope mt-1 hidden sm:block">
              Create and manage discount codes for checkout
            </p>
          </div>
          <button
            onClick={() => setFormModal({ isOpen: true, mode: "create", initialData: null })}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F3BC48] hover:bg-[#e5a920] text-[#173151] font-semibold rounded-lg transition-colors shadow-sm font-manrope text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Discount
          </button>
        </div>

        <div className="shrink-0">
          <FilterBar
            searchValue={searchQuery}
            searchPlaceholder="Search by code or description..."
            onSearch={setSearchQuery}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col pb-2">
          <DataTable
            columns={columns}
            data={discounts}
            loading={loading}
            emptyMessage="No discount codes found"
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
      />

      <DiscountForm
        isOpen={formModal.isOpen}
        onClose={() => setFormModal((prev) => ({ ...prev, isOpen: false }))}
        mode={formModal.mode}
        initialData={formModal.initialData}
        programs={programs}
        classes={classes}
        onSuccess={fetchDiscounts}
      />
    </div>
  );
}
