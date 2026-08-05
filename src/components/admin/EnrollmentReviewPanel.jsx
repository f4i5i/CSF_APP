import React from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  GraduationCap,
  FileText,
  DollarSign,
  Repeat,
  XCircle,
  Mail,
} from "lucide-react";
import { formatDate, formatGrade } from "../../utils/format";

const DOC_STYLES = {
  signed: { icon: CheckCircle2, cls: "text-green-600", label: "Signed" },
  outdated: { icon: AlertTriangle, cls: "text-yellow-600", label: "New version" },
  pending: { icon: Clock, cls: "text-yellow-500", label: "Pending" },
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  waitlisted: "bg-purple-100 text-purple-800",
};

const PAY_STATUS_STYLES = {
  succeeded: "text-green-600",
  refunded: "text-gray-500",
  due: "text-red-600",
  failed: "text-red-600",
  pending: "text-yellow-600",
};

const Section = ({ icon: Icon, title, children }) => (
  <div>
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 font-manrope mb-2">
      <Icon className="w-4 h-4" /> {title}
    </p>
    {children}
  </div>
);

/**
 * Right-side Enrollment Review drawer: child + placement details, required
 * documents checklist, and (owner only) a payment timeline with actions.
 */
export default function EnrollmentReviewPanel({
  open,
  loading,
  data,
  onClose,
  onApprove,
  onReassign,
  onCancel,
  onSendReminder,
  onSendPaymentLink,
}) {
  if (!open) return null;

  const status = data?.status;
  const payments = data?.payments;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#f6f8fb] z-50 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-border-light bg-white/70">
          <div>
            <h2 className="text-xl font-semibold text-[#173151] font-kollektif">
              Enrollment Review
            </h2>
            <p className="text-xs text-gray-500 font-manrope">
              Review details, documents, and payment before acting.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading || !data ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-btn-gold"></div>
            </div>
          ) : (
            <>
              {/* Child header */}
              <div className="bg-white/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#173151]/10 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-[#173151]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#173151] font-manrope truncate">
                      {data.child?.name || "Unknown child"}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        STATUS_COLORS[status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-manrope">
                    {data.child?.age != null && `Age ${data.child.age}`}
                    {data.child?.dob && ` · DOB ${formatDate(data.child.dob)}`}
                    {data.child?.grade &&
                      ` · Grade ${formatGrade ? formatGrade(data.child.grade) : data.child.grade}`}
                  </p>
                  <p className="text-xs text-gray-500 font-manrope truncate">
                    {data.parent?.name}
                    {data.parent?.email && ` · ${data.parent.email}`}
                    {data.parent?.phone && ` · ${data.parent.phone}`}
                  </p>
                </div>
              </div>

              {/* Class placement */}
              <Section icon={GraduationCap} title="Class placement">
                <div className="bg-white/80 rounded-2xl p-4 shadow-sm text-sm font-manrope space-y-1.5">
                  {[
                    ["Program", data.placement?.program],
                    ["Class", data.placement?.class_name],
                    ["Location", data.placement?.location],
                    [
                      "Start date",
                      data.placement?.start_date
                        ? formatDate(data.placement.start_date)
                        : null,
                    ],
                    ["Schedule", data.placement?.schedule],
                  ].map(
                    ([label, value]) =>
                      value && (
                        <div key={label} className="flex justify-between gap-3">
                          <span className="text-gray-500">{label}</span>
                          <span className="text-[#173151] font-semibold text-right">
                            {value}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              </Section>

              {/* Documents checklist */}
              <Section icon={FileText} title="Required documents">
                <div className="bg-white/80 rounded-2xl p-4 shadow-sm space-y-2.5">
                  {(data.documents || []).length === 0 ? (
                    <p className="text-sm text-gray-500 font-manrope">
                      No required documents configured.
                    </p>
                  ) : (
                    data.documents.map((doc) => {
                      const style = DOC_STYLES[doc.status] || DOC_STYLES.pending;
                      const Icon = style.icon;
                      return (
                        <div
                          key={doc.name}
                          className="flex items-center gap-2.5 text-sm font-manrope"
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${style.cls}`} />
                          <span className="text-[#173151] flex-1">
                            {doc.name}
                          </span>
                          <span
                            className={`text-xs font-semibold ${style.cls}`}
                            title={doc.signed_at ? formatDate(doc.signed_at) : ""}
                          >
                            {style.label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </Section>

              {/* Payment timeline (owner only) */}
              {payments && (
                <Section icon={DollarSign} title="Payment timeline">
                  <div className="bg-white/80 rounded-2xl p-4 shadow-sm">
                    {(payments.timeline || []).length === 0 ? (
                      <p className="text-sm text-gray-500 font-manrope">
                        No payments recorded yet.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {payments.timeline.map((t, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-sm font-manrope"
                          >
                            <span
                              className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                t.status === "due"
                                  ? "bg-red-500"
                                  : t.status === "succeeded"
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[#173151] truncate">
                                {t.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t.date ? formatDate(t.date) : "—"}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-semibold text-[#173151]">
                                ${Number(t.amount).toFixed(2)}
                              </p>
                              <p
                                className={`text-xs font-semibold capitalize ${
                                  PAY_STATUS_STYLES[t.status] || "text-gray-500"
                                }`}
                              >
                                {t.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-border-light mt-3 pt-3 text-sm font-manrope">
                      <span className="text-gray-500 font-semibold">
                        Total due
                      </span>
                      <span
                        className={`font-bold ${
                          payments.total_due > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ${Number(payments.total_due || 0).toFixed(2)}
                      </span>
                    </div>
                    {payments.total_due > 0 && (
                      <button
                        type="button"
                        onClick={
                          status === "pending" ? onSendPaymentLink : onSendReminder
                        }
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#173151]/20 text-[#173151] text-sm font-semibold font-manrope hover:bg-[#173151]/5"
                      >
                        <Mail className="w-4 h-4" /> Send Payment Reminder
                      </button>
                    )}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {data && !loading && (
          <div className="p-5 border-t border-border-light bg-white/70 space-y-2">
            {status === "pending" && (
              <button
                type="button"
                onClick={onApprove}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-semibold font-manrope hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Enrollment
              </button>
            )}
            {status !== "cancelled" && (
              <>
                <button
                  type="button"
                  onClick={onReassign}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#173151]/20 text-[#173151] font-semibold font-manrope hover:bg-[#173151]/5"
                >
                  <Repeat className="w-4 h-4" /> Reassign Class
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-semibold font-manrope hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" /> Cancel Enrollment
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
