export const dayMap: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const to12Hour = (time: string) => {
  if (!time) return "";
  // If already in 12-hour format (contains AM/PM), return as-is
  if (/[AP]M/i.test(time)) return time;
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatSchedule = (
  schedule?: Array<{
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
  }>,
) => {
  if (!schedule || schedule.length === 0) return "Schedule TBA";
  const first = schedule[0];
  const day = first.day_of_week
    ? dayMap[first.day_of_week] || first.day_of_week
    : "";
  const start = to12Hour(first.start_time ?? "");
  const end = to12Hour(first.end_time ?? "");
  return `${day} • ${start}${end ? `–${end}` : ""}`;
};

/**
 * Build a schedule array from flat backend class fields.
 * The backend returns weekdays, start_time, end_time as separate fields
 * but formatSchedule expects an array of { day_of_week, start_time, end_time }.
 */
export const buildScheduleFromClass = (cls: {
  weekdays?: string[];
  start_time?: string;
  end_time?: string;
  schedule?: Array<{
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
  }>;
}): Array<{ day_of_week?: string; start_time?: string; end_time?: string }> => {
  // If schedule array already exists, use it
  if (cls.schedule && cls.schedule.length > 0) return cls.schedule;
  // Build from flat fields
  if (!cls.weekdays || cls.weekdays.length === 0) return [];
  return cls.weekdays.map((day) => ({
    day_of_week: day.toUpperCase(),
    start_time: cls.start_time ?? undefined,
    end_time: cls.end_time ?? undefined,
  }));
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return "Dates TBA";
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
};
