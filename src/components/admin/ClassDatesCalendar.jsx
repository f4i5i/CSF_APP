import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  parseISO,
  addDays,
  getISOWeek,
  format,
  differenceInCalendarMonths,
} from "date-fns";
import { CalendarDays, Wand2, Trash2 } from "lucide-react";

// JS getDay(): Sunday=0..Saturday=6. Mirrors the backend weekday mapping.
const JS_WEEKDAY = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const WEEKDAYS = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const toISO = (d) => format(d, "yyyy-MM-dd");

/**
 * Expand a recurrence rule into explicit session dates (ISO strings).
 * Mirrors app/utils/class_dates.generate_class_dates on the backend so the
 * "Generate" convenience and the server-side logic agree.
 */
export const generateClassDates = (
  startISO,
  endISO,
  weekdays,
  repeatEveryWeeks,
) => {
  if (!startISO || !endISO) return [];
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  if (end < start) return [];

  const repeat = Number(repeatEveryWeeks) || 1;
  const targets = (weekdays || [])
    .map((d) => JS_WEEKDAY[String(d).toLowerCase()])
    .filter((n) => n !== undefined);
  if (targets.length === 0) return [];

  const out = [];
  let current = start;
  let weekCount = 0;
  let lastWeek = null;
  while (current <= end) {
    const wk = getISOWeek(current);
    if (lastWeek !== null && wk !== lastWeek) weekCount += 1;
    lastWeek = wk;
    if (weekCount % repeat === 0 && targets.includes(current.getDay())) {
      out.push(current);
    }
    current = addDays(current, 1);
  }
  return out.map(toISO);
};

/**
 * Multi-month calendar for picking explicit class session dates, with a
 * built-in "quick fill" helper (pick weekday(s) + interval -> Generate).
 *
 * @param {string[]} value     Selected dates as ISO "YYYY-MM-DD" strings
 * @param {(iso: string[]) => void} onChange
 * @param {string} startDate   ISO range start (for the Generate fill + default view)
 * @param {string} endDate     ISO range end
 * @param {string[]} [weekdays] Optional seed for the quick-fill weekday toggles
 */
const ClassDatesCalendar = ({
  value = [],
  onChange,
  startDate,
  endDate,
  weekdays = [],
}) => {
  const [genWeekdays, setGenWeekdays] = useState(
    () => new Set((weekdays || []).map((w) => String(w).toLowerCase())),
  );
  const [genInterval, setGenInterval] = useState(1);

  const selectedDates = useMemo(
    () => (value || []).map((iso) => parseISO(iso)),
    [value],
  );

  // Show up to 2 months side by side; navigate the rest via dropdown/arrows.
  const numberOfMonths = useMemo(() => {
    const refStart = startDate
      ? parseISO(startDate)
      : selectedDates[0] || new Date();
    const refEnd = endDate
      ? parseISO(endDate)
      : selectedDates[selectedDates.length - 1] || refStart;
    const span = differenceInCalendarMonths(refEnd, refStart) + 1;
    return Math.min(Math.max(span, 1), 2);
  }, [startDate, endDate, selectedDates]);

  const defaultMonth = useMemo(() => {
    if (startDate) return parseISO(startDate);
    if (selectedDates[0]) return selectedDates[0];
    return new Date();
  }, [startDate, selectedDates]);

  // Bounded navigable window so the month/year dropdowns have a useful range.
  const [navStart, navEnd] = useMemo(() => {
    const base = startDate
      ? parseISO(startDate)
      : selectedDates[0] || new Date();
    const y = base.getFullYear();
    return [new Date(y - 1, 0, 1), new Date(y + 2, 11, 31)];
  }, [startDate, selectedDates]);

  const toggleWeekday = (day) => {
    setGenWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const canGenerate = Boolean(
    startDate && endDate && genWeekdays.size > 0,
  );

  const handleGenerate = () => {
    const generated = generateClassDates(
      startDate,
      endDate,
      Array.from(genWeekdays),
      genInterval,
    );
    onChange?.(generated);
  };

  const handleSelect = (dates) => {
    const iso = (dates || []).map(toISO).sort();
    onChange?.(iso);
  };

  // Group selected dates by month for the summary list.
  const grouped = useMemo(() => {
    const map = new Map();
    [...(value || [])].sort().forEach((iso) => {
      const d = parseISO(iso);
      const key = format(d, "MMM yyyy");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d.getDate());
    });
    return Array.from(map.entries());
  }, [value]);

  return (
    <div className="space-y-4">
      {/* Quick-fill helper */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-600 font-manrope">
          Quick fill
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleWeekday(d.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors font-manrope ${
                genWeekdays.has(d.value)
                  ? "bg-[#1D3557] text-white border-[#1D3557]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {d.label}
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-1 font-manrope">every</span>
          <select
            value={genInterval}
            onChange={(e) => setGenInterval(Number(e.target.value))}
            className="text-xs border border-gray-300 rounded-md px-1.5 py-1 bg-white"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500 font-manrope">week(s)</span>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-[#1D3557] text-white hover:bg-[#152942] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-manrope"
          >
            <Wand2 size={15} />
            Generate
          </button>
        </div>
        {!canGenerate && (
          <p className="text-[11px] text-gray-400 font-manrope">
            Set start &amp; end dates and pick at least one weekday to generate.
          </p>
        )}
      </div>

      {/* Selection status / clear */}
      <div className="flex flex-wrap items-center gap-2">
        {value?.length > 0 && (
          <button
            type="button"
            onClick={() => onChange?.([])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors font-manrope"
          >
            <Trash2 size={15} />
            Clear all
          </button>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D3557] font-manrope">
          <CalendarDays size={16} />
          {value?.length || 0} session{value?.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Calendar */}
      <p className="text-xs text-gray-500 font-manrope">
        Use the month / year dropdowns (or the ‹ › arrows) to move between
        months. Click a day to add or remove it.
      </p>
      <div className="rounded-xl border border-gray-200 p-2 overflow-x-auto">
        <DayPicker
          mode="multiple"
          numberOfMonths={numberOfMonths}
          defaultMonth={defaultMonth}
          startMonth={navStart}
          endMonth={navEnd}
          captionLayout="dropdown"
          pagedNavigation
          selected={selectedDates}
          onSelect={handleSelect}
          modifiersStyles={{
            selected: {
              backgroundColor: "#15803d",
              color: "#fff",
            },
          }}
          className="!text-black !font-manrope"
        />
      </div>

      {/* Selected dates summary */}
      {grouped.length > 0 && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1.5 font-manrope">
            Selected dates
          </p>
          <div className="space-y-0.5">
            {grouped.map(([month, days]) => (
              <p key={month} className="text-sm text-[#0F1D2E] font-manrope">
                <span className="font-medium">{month}:</span> {days.join(", ")}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDatesCalendar;
