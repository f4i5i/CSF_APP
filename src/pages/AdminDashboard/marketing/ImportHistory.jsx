/**
 * Marketing Import History
 * Past spreadsheet uploads with counts + a downloadable rejected-row report.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../../../components/Header";
import DataTable from "../../../components/admin/DataTable";
import marketingService from "../../../api/services/marketing.service";

const PER_PAGE = 25;

export default function MarketingImportHistory() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketingService.getOperations({
        operation_type: "upload",
        page,
        per_page: PER_PAGE,
      });
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

  const downloadErrors = async (id, fileName) => {
    try {
      const blob = await marketingService.downloadOperationErrors(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `import_errors_${fileName || id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not download error report");
    }
  };

  const columns = [
    { key: "file_name", label: "File", render: (v) => v || "—" },
    {
      key: "inserted_count",
      label: "Inserted",
      render: (v) => <span className="text-green-700 font-medium">{v ?? 0}</span>,
    },
    {
      key: "skipped_count",
      label: "Skipped",
      render: (v) =>
        v ? <span className="text-amber-700 font-medium">{v}</span> : "0",
    },
    { key: "status", label: "Status", render: (v) => v || "—" },
    {
      key: "created_at",
      label: "Date",
      render: (v) => (v ? new Date(v).toLocaleString() : "—"),
    },
    {
      key: "actions",
      label: "",
      render: (_v, row) =>
        row.skipped_count ? (
          <button
            onClick={() => downloadErrors(row.id, row.file_name)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-primary bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-3.5 h-3.5" /> Errors
          </button>
        ) : null,
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <h1 className="text-2xl font-bold font-kollektif text-text-primary">
          Import History
        </h1>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No imports yet."
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
