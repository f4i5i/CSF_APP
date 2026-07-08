/**
 * Marketing Segments
 * List saved filter segments; email or delete them.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Trash2, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../../../components/Header";
import marketingService from "../../../api/services/marketing.service";

export default function MarketingSegments() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketingService.getSegments();
      setSegments(res.data || []);
    } catch (err) {
      toast.error("Failed to load segments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this segment?")) return;
    try {
      await marketingService.deleteSegment(id);
      toast.success("Segment deleted");
      load();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const describe = (filters) =>
    (filters || [])
      .map((f) => `${f.field} ${f.op}${f.value ? ` ${f.value}` : ""}`)
      .join(" · ") || "All contacts";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <h1 className="text-2xl font-bold font-kollektif text-text-primary">
          Segments
        </h1>

        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : segments.length === 0 ? (
          <div className="bg-white/70 rounded-2xl p-10 text-center text-gray-500">
            <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No saved segments yet. Build a filter on the Contacts page and click
            “Save as segment.”
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {segments.map((s) => (
              <div
                key={s.id}
                className="bg-white/70 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-text-primary">{s.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {describe(s.filters)}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() =>
                      navigate("/admin/marketing/compose", {
                        state: { segmentId: s.id },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-[#173963] rounded-lg hover:bg-[#12305a]"
                  >
                    <Send className="w-4 h-4" /> Email
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
