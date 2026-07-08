/**
 * FilterBuilder
 * Chip-based dynamic filter builder for marketing contacts. Fetches the
 * backend filter schema (fields + allowed operators) and emits an array of
 * "field:op:value" strings (the format GET /marketing/records expects).
 */

import React, { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import marketingService from "../../../api/services/marketing.service";

const NULLARY_OPS = new Set(["is_null", "not_null"]);

const OP_LABELS = {
  equals: "equals",
  contains: "contains",
  range: "between (min,max)",
  in: "in list (a,b,c)",
  is_null: "is empty",
  not_null: "is not empty",
};

export default function FilterBuilder({ value = [], onChange }) {
  const [schema, setSchema] = useState([]);
  const [draft, setDraft] = useState({ field: "", op: "", value: "" });

  useEffect(() => {
    let active = true;
    marketingService
      .getFilterSchema()
      .then((res) => {
        if (active) setSchema(res.fields || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const fieldMeta = useMemo(
    () => schema.find((f) => f.name === draft.field),
    [schema, draft.field]
  );

  const addChip = () => {
    if (!draft.field || !draft.op) return;
    const needsValue = !NULLARY_OPS.has(draft.op);
    if (needsValue && draft.value.trim() === "") return;
    const chip = needsValue
      ? `${draft.field}:${draft.op}:${draft.value.trim()}`
      : `${draft.field}:${draft.op}:`;
    onChange([...(value || []), chip]);
    setDraft({ field: "", op: "", value: "" });
  };

  const removeChip = (idx) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const prettyChip = (chip) => {
    const [field, op, ...rest] = chip.split(":");
    const val = rest.join(":");
    const opLabel = OP_LABELS[op] || op;
    return NULLARY_OPS.has(op)
      ? `${field} ${opLabel}`
      : `${field} ${opLabel} "${val}"`;
  };

  return (
    <div className="space-y-3">
      {/* Active chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((chip, idx) => (
            <span
              key={`${chip}-${idx}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#173963] text-white text-xs font-medium px-3 py-1.5"
            >
              {prettyChip(chip)}
              <button
                type="button"
                onClick={() => removeChip(idx)}
                className="hover:text-red-300"
                aria-label="Remove filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Draft row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={draft.field}
          onChange={(e) =>
            setDraft({ field: e.target.value, op: "", value: "" })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-btn-gold"
        >
          <option value="">Field…</option>
          {schema.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>

        <select
          value={draft.op}
          onChange={(e) => setDraft((d) => ({ ...d, op: e.target.value }))}
          disabled={!fieldMeta}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-btn-gold disabled:opacity-50"
        >
          <option value="">Operator…</option>
          {(fieldMeta?.operators || []).map((op) => (
            <option key={op} value={op}>
              {OP_LABELS[op] || op}
            </option>
          ))}
        </select>

        {!NULLARY_OPS.has(draft.op) && (
          <input
            type="text"
            value={draft.value}
            onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChip();
              }
            }}
            placeholder={
              draft.op === "range"
                ? "min,max"
                : draft.op === "in"
                ? "a,b,c"
                : "value"
            }
            disabled={!draft.op}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold disabled:opacity-50"
          />
        )}

        <button
          type="button"
          onClick={addChip}
          disabled={!draft.field || !draft.op}
          className="inline-flex items-center gap-1 px-3 py-2 bg-btn-gold text-heading-dark text-sm font-semibold rounded-lg hover:bg-[#e5ad35] disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
    </div>
  );
}
