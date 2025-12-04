import React from "react";

export default function Pagination({ page, setPage, pages }) {
  const prev = () => setPage((p) => Math.max(1, p - 1));
  const next = () => setPage((p) => Math.min(pages, p + 1));

  // simple page range
  const visible = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  for (let i = start; i <= end; i++) visible.push(i);

  return (
    <div className="flex items-center gap-2">
      <button onClick={prev} className="px-3 py-1 rounded border bg-gray-50">Prev</button>

      {start > 1 && (
        <>
          <button onClick={() => setPage(1)} className="px-3 py-1 rounded border bg-white">1</button>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {visible.map((n) => (
        <button
          key={n}
          onClick={() => setPage(n)}
          className={`px-3 py-1 rounded ${n === page ? "bg-[#173151] text-white" : "bg-white border"}`}
        >
          {n}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-2">…</span>}
          <button onClick={() => setPage(pages)} className="px-3 py-1 rounded border bg-white">{pages}</button>
        </>
      )}

      <button onClick={next} className="px-3 py-1 rounded border bg-gray-50">Next</button>
    </div>
  );
}
