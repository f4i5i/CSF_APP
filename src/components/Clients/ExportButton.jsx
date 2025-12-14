import React from "react";

/**
 * CSV export helper. If itemsToExport is an array of ids, it will filter by those.
 * Otherwise exports allData.
 */
export default function ExportButton({ itemsToExport = null, allData = [] }) {
  const handleExport = () => {
    const exportData = itemsToExport && itemsToExport.length ? allData.filter((r) => itemsToExport.includes(r.id)) : allData;
    if (!exportData || exportData.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ["id", "lastName", "firstName", "email", "phone", "status", "class", "regDate", "balance"];
    const rows = exportData.map((r) => headers.map((h) => csvCell(r[h])));
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(csv, `export_${Date.now()}.csv`);
  };

  return (
    <button onClick={handleExport} className="sm:px-3 px-2 py-2 rounded-lg border font-manrope bg-gray-50  sm:text-sm text-[10px]">
      Export CSV
    </button>
  );
}

function csvCell(v) {
  if (v === null || v === undefined) return '""';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

function downloadCSV(text, filename) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
