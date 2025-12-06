import { getOfferingLabel } from "../utils/classHelpers";

const InfoRow = ({ label, value }) => (
  <div className="rounded-lg border border-white/40 bg-white/60 p-3">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-[#0D0D12]">{value}</p>
  </div>
);

export default function ClassCard({ cls, onClick, onRegister }) {
  const badgeLabel = cls.badgeLabel || getOfferingLabel(cls.offeringType);
  const totalCapacity = cls.capacity?.total ?? (typeof cls.capacity === 'number' ? cls.capacity : 0);
  const filledCapacity = cls.capacity?.filled ?? cls.current_enrollment ?? 0;
  const spotsRemaining = typeof cls.spotsRemaining === 'number'
    ? cls.spotsRemaining
    : Math.max(totalCapacity - filledCapacity, 0);
  const waitlistCount = cls.waitlistCount ?? cls.waitlist_count ?? 0;
  const hasCapacity =
    typeof cls.hasCapacity === 'boolean' ? cls.hasCapacity : !(totalCapacity > 0 && spotsRemaining <= 0);
  const isFull = !hasCapacity;
  const priceLabel = cls.priceLabel || (cls.price ? `$${cls.price}` : 'Contact for pricing');
  const capacityLabel = totalCapacity
    ? `${filledCapacity}/${totalCapacity} enrolled`
    : `${filledCapacity} enrolled`;

  return (
    <div
      className="bg-[#FFFFFF90] shadow rounded-2xl overflow-hidden hover:shadow-xl transition cursor-pointer border border-white/70"
      onClick={onClick}
    >
      <div className="p-4 space-y-4">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {cls.image ? (
              <img src={cls.image} className="w-full h-full object-cover" alt={cls.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Image TBA</div>
            )}
            {badgeLabel && (
              <span className="absolute top-2 left-2 rounded-full bg-[#F3BC48] px-2 py-0.5 text-xs font-semibold text-[#0D0D12]">
                {badgeLabel}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">{cls.school}</p>
            <h3 className="text-xl font-semibold text-[#173151] leading-tight">{cls.title}</h3>
            {cls.programName && (
              <p className="text-sm font-medium text-gray-600">{cls.programName}</p>
            )}
            {cls.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{cls.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="Dates" value={cls.dates} />
          <InfoRow label="Schedule" value={cls.time} />
          <InfoRow label="Ages" value={cls.ages} />
          <InfoRow label="Capacity" value={capacityLabel} />
          <InfoRow label="Price" value={priceLabel} />
          {cls.priceModel && <InfoRow label="Price model" value={cls.priceModel} />}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`text-sm font-semibold ${isFull ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isFull ? 'Waitlist only' : spotsRemaining > 0 ? `${spotsRemaining} spots available` : 'Limited spots'}
            </p>
            <p className="text-xs text-gray-500">
              {isFull
                ? waitlistCount > 0
                  ? `${waitlistCount} player${waitlistCount === 1 ? '' : 's'} on waitlist`
                  : 'Waitlist available'
                : 'Capacity updates in real-time'}
            </p>
          </div>

          <button
            className="border border-[#F3BC48] rounded-full px-6 py-2 bg-[#F3BC48] text-[#0D0D12] font-semibold text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onRegister?.();
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
