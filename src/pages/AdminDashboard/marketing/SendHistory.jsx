/**
 * Marketing Send History
 * Past marketing email sends with recipient / delivery counts and status.
 */

import React, { useCallback, useEffect, useState } from "react";
import Header from "../../../components/Header";
import DataTable from "../../../components/admin/DataTable";
import marketingService from "../../../api/services/marketing.service";

const PER_PAGE = 25;

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700",
  sending: "bg-blue-100 text-blue-700",
  queued: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-700",
};

export default function MarketingSendHistory() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketingService.getSends({ page, per_page: PER_PAGE });
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { key: "subject", label: "Subject", render: (v) => v || "—" },
    {
      key: "recipients_total",
      label: "Recipients",
      render: (v) => v ?? 0,
    },
    {
      key: "sent_count",
      label: "Sent",
      render: (v) => <span className="text-green-700 font-medium">{v ?? 0}</span>,
    },
    {
      key: "failed_count",
      label: "Failed",
      render: (v) =>
        v ? <span className="text-red-700 font-medium">{v}</span> : "0",
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            STATUS_STYLES[v] || "bg-gray-100 text-gray-600"
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (v) => (v ? new Date(v).toLocaleString() : "—"),
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <h1 className="text-2xl font-bold font-kollektif text-text-primary">
          Send History
        </h1>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No emails sent yet."
          pagination
          itemsPerPage={PER_PAGE}
          currentPage={page}
          totalItems={total}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
