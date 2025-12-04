export const dayMap: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

const to12Hour = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatSchedule = (schedule?: Array<{ day_of_week?: string; start_time?: string; end_time?: string }>) => {
  if (!schedule || schedule.length === 0) return 'Schedule TBA';
  const first = schedule[0];
  const day = first.day_of_week ? dayMap[first.day_of_week] || first.day_of_week : '';
  const start = to12Hour(first.start_time ?? '');
  const end = to12Hour(first.end_time ?? '');
  return `${day} • ${start}${end ? `–${end}` : ''}`;
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return 'Dates TBA';
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
};
