import AnnouncementItem from "./AnnouncementItem";

export default function AnnouncementCard({ announcements = [], loading = false }) {
  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/20 py-fluid-4 px-fluid-4 rounded-fluid-lg animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!announcements || announcements.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="font-medium">No announcements yet</p>
          <p className="text-sm mt-1">Check back later for updates</p>
        </div>
      </div>
    );
  }

  // Helper function to generate avatar from initials
  const getAvatarUrl = (announcement) => {
    // If avatar URL exists, use it
    if (announcement.created_by?.avatar || announcement.author?.avatar) {
      return announcement.created_by?.avatar || announcement.author?.avatar;
    }

    // Generate avatar with initials
    const name = announcement.author_name || announcement.created_by?.name || announcement.author?.name || 'Coach';
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Generate a color based on the name for consistency
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-white-500'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;

    return { initials, color: colors[colorIndex], isPlaceholder: true };
  };

  // Transform API data to match expected format
  const transformedAnnouncements = announcements.map((announcement) => {
    const avatarData = getAvatarUrl(announcement);

    return {
      id: announcement.id,
      avatar: typeof avatarData === 'string' ? avatarData : avatarData,
      name: announcement.author_name || announcement.created_by?.name || announcement.author?.name || 'Coach',
      date: announcement.created_at
        ? new Date(announcement.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'Recently',
      title: announcement.title,
      description: announcement.content || announcement.description,
      attachments: announcement.attachments || announcement.attachment_urls || [],
      priority: announcement.priority,
      type: announcement.type,
      is_read: announcement.is_read,
    };
  });

  return (
    <div className="w-full">
      <div className="flex flex-col gap-[10px]">
        {transformedAnnouncements.map((item) => (
          <div
            key={item.id}
            className="relative flex flex-col bg-white/50 p-fluid-5 rounded-fluid-lg"
          >
            {/* Priority badge */}
            {item.priority === 'high' && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  Urgent
                </span>
              </div>
            )}

            <AnnouncementItem item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
