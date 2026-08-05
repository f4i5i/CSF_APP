import React from "react";
import {
  X,
  Mail,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
} from "lucide-react";
import { formatDate } from "../../utils/format";

const TONE_STYLES = {
  success: "text-green-600",
  danger: "text-red-600",
  neutral: "text-gray-600",
};

/**
 * Right-side Client Details drawer: contact info, children with their active
 * enrollments, and — for owners — an outstanding balance card and recent
 * payment/invoice activity. "Send Message" opens the Mass Email composer
 * pre-addressed to this client (the app's standard email flow).
 */
export default function ClientDetailsPanel({
  open,
  loading,
  client,
  details,
  canSeeFinancials,
  onClose,
  onSendMessage,
  onViewInvoices,
}) {
  if (!open) return null;

  const balance = details?.balance;
  const activity = details?.recent_activity || [];
  const enrollmentsByChild = {};
  (details?.active_enrollments || []).forEach((e) => {
    (enrollmentsByChild[e.child_name] ||= []).push(e);
  });

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#f6f8fb] z-50 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-border-light bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#173151]/10 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-[#173151]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#173151] font-kollektif">
                {client
                  ? `${client.first_name} ${client.last_name}`.trim()
                  : "Client Details"}
              </h2>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                  client?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : client?.status === "payment_due"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {client?.status === "payment_due"
                  ? "Payment due"
                  : client?.status === "active"
                    ? "Active"
                    : "Inactive"}
              </span>
            </div>
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
          {loading || !details ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-btn-gold"></div>
            </div>
          ) : (
            <>
              {/* Contact */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 font-manrope mb-2">
                  Contact information
                </p>
                <div className="bg-white/80 rounded-2xl p-4 shadow-sm space-y-2 text-sm font-manrope">
                  <p className="flex items-center gap-2 text-[#173151]">
                    <Mail className="w-4 h-4 text-gray-400" /> {details.email}
                  </p>
                  {details.phone && (
                    <p className="flex items-center gap-2 text-[#173151]">
                      <Phone className="w-4 h-4 text-gray-400" /> {details.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Client since {formatDate(details.created_at)}
                  </p>
                </div>
              </div>

              {/* Children */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 font-manrope mb-2">
                  Children ({(details.children || []).length})
                </p>
                <div className="bg-white/80 rounded-2xl p-4 shadow-sm space-y-3">
                  {(details.children || []).length === 0 ? (
                    <p className="text-sm text-gray-500 font-manrope">
                      No children on file.
                    </p>
                  ) : (
                    details.children.map((ch) => {
                      const name = `${ch.first_name} ${ch.last_name}`;
                      const enrs = enrollmentsByChild[name] || [];
                      return (
                        <div key={ch.id} className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F3BC48]/20 flex items-center justify-center shrink-0 text-xs font-bold text-[#173151]">
                            {(ch.first_name?.[0] || "") + (ch.last_name?.[0] || "")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#173151] font-manrope">
                              {name}
                            </p>
                            {enrs.length > 0 ? (
                              enrs.map((e) => (
                                <p
                                  key={e.id}
                                  className="text-xs text-gray-500 font-manrope truncate"
                                >
                                  {e.class_name}
                                </p>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 font-manrope">
                                No active enrollment
                              </p>
                            )}
                          </div>
                          {enrs.length > 0 && (
                            <span className="text-xs font-semibold text-green-600 font-manrope shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Balance (owner only) */}
              {canSeeFinancials && balance && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 font-manrope mb-2">
                    Balance
                  </p>
                  <div
                    className={`rounded-2xl p-4 shadow-sm ${
                      balance.amount_due > 0
                        ? "bg-red-50 border border-red-100"
                        : "bg-green-50 border border-green-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-semibold font-manrope ${
                          balance.amount_due > 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {balance.amount_due > 0 ? "Payment due" : "All paid up"}
                      </p>
                      <p
                        className={`text-xl font-bold font-kollektif ${
                          balance.amount_due > 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        ${Number(balance.amount_due || 0).toFixed(2)}
                      </p>
                    </div>
                    {balance.due_date && balance.amount_due > 0 && (
                      <p className="text-xs text-gray-500 font-manrope mt-1">
                        Due date: {formatDate(balance.due_date)} ·{" "}
                        {balance.open_invoices} open invoice
                        {balance.open_invoices === 1 ? "" : "s"}
                      </p>
                    )}
                    {balance.amount_due > 0 && (
                      <button
                        type="button"
                        onClick={onViewInvoices}
                        className="mt-3 w-full px-4 py-2 rounded-lg bg-btn-gold text-[#173151] text-sm font-semibold font-manrope hover:opacity-90"
                      >
                        View Invoices
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Recent activity (owner only) */}
              {canSeeFinancials && activity.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 font-manrope mb-2">
                    Recent activity
                  </p>
                  <div className="bg-white/80 rounded-2xl p-4 shadow-sm space-y-3">
                    {activity.map((a, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        {a.tone === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        ) : a.tone === "danger" ? (
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold font-manrope ${
                              TONE_STYLES[a.tone] || TONE_STYLES.neutral
                            }`}
                          >
                            {a.label}
                          </p>
                          <p className="text-xs text-gray-500 font-manrope truncate">
                            {a.detail}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 font-manrope shrink-0">
                          {a.date ? formatDate(a.date) : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canSeeFinancials && details.total_spent > 0 && (
                <p className="text-xs text-gray-500 font-manrope text-center">
                  Lifetime total collected: $
                  {Number(details.total_spent).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              )}
            </>
          )}
        </div>

        <div className="p-5 border-t border-border-light bg-white/70">
          <button
            type="button"
            onClick={onSendMessage}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#173151] text-white font-semibold font-manrope hover:opacity-90"
          >
            <MessageSquare className="w-4 h-4" /> Send Message
          </button>
        </div>
      </div>
    </>
  );
}
