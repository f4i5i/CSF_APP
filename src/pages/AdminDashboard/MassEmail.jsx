import React, { useState, useEffect, useMemo } from "react";
import { Mail, Send, Users, Loader2, CheckCircle, AlertCircle, Eye, X } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Header from "../../components/Header";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import adminService from "../../api/services/admin.service";
import toast from "react-hot-toast";

const RECIPIENT_TYPES = [
  { value: "all", label: "All Parents", description: "Send to all registered parents" },
  { value: "class", label: "By Class", description: "Send to parents of a specific class" },
  { value: "program", label: "By Program", description: "Send to parents in a program" },
  { value: "area", label: "By Area", description: "Send to parents in an area" },
];

export default function MassEmail() {
  const [recipientType, setRecipientType] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Data for dropdowns
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [showPreview, setShowPreview] = useState(false);

  // Quill editor toolbar configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  }), []);

  const quillFormats = [
    "header", "bold", "italic", "underline", "strike",
    "color", "background", "list", "bullet", "align", "link",
  ];

  // Check if message has actual content (not just empty tags)
  const hasMessageContent = useMemo(() => {
    if (!message) return false;
    const stripped = message.replace(/<[^>]*>/g, "").trim();
    return stripped.length > 0;
  }, [message]);

  // Fetch classes, programs, areas for dropdown selection
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [classesRes, programsRes, areasRes] = await Promise.allSettled([
          import("../../api/services/classes.service").then((m) => m.default.getAll()),
          import("../../api/services/programs.service").then((m) => m.default.getAll()),
          import("../../api/services/areas.service").then((m) => m.default.getAll()),
        ]);

        if (classesRes.status === "fulfilled") {
          setClasses(classesRes.value?.items || classesRes.value || []);
        }
        if (programsRes.status === "fulfilled") {
          setPrograms(programsRes.value?.items || programsRes.value || []);
        }
        if (areasRes.status === "fulfilled") {
          setAreas(areasRes.value?.items || areasRes.value || []);
        }
      } catch {
        // Silently fail - dropdowns will be empty
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const validate = () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return false;
    }
    if (!hasMessageContent) {
      toast.error("Message is required");
      return false;
    }
    if (recipientType === "class" && !selectedClassId) {
      toast.error("Please select a class");
      return false;
    }
    if (recipientType === "program" && !selectedProgramId) {
      toast.error("Please select a program");
      return false;
    }
    if (recipientType === "area" && !selectedAreaId) {
      toast.error("Please select an area");
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;

    setConfirmDialog({
      isOpen: true,
      title: "Send Mass Email",
      message: `Are you sure you want to send this email to ${getRecipientLabel()}? This action cannot be undone.`,
      action: confirmSend,
    });
  };

  const confirmSend = async () => {
    setConfirmDialog({ isOpen: false });
    setIsSending(true);
    setSendResult(null);

    try {
      const payload = {
        recipient_type: recipientType,
        subject: subject.trim(),
        message: message,
        include_parents: true,
      };

      if (recipientType === "class") payload.class_id = selectedClassId;
      if (recipientType === "program") payload.program_id = selectedProgramId;
      if (recipientType === "area") payload.area_id = selectedAreaId;

      const result = await adminService.sendBulkEmail(payload);
      setSendResult(result);

      if (result.successful > 0) {
        toast.success(`Email sent to ${result.successful} recipient(s)`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} email(s) failed to send`);
      }
    } catch (error) {
      console.error("Failed to send bulk email:", error);
      const msg = error.response?.data?.detail || error.response?.data?.message || "Failed to send emails";
      toast.error(typeof msg === "string" ? msg : "Failed to send emails");
    } finally {
      setIsSending(false);
    }
  };

  const getRecipientLabel = () => {
    switch (recipientType) {
      case "all":
        return "all parents";
      case "class": {
        const cls = classes.find((c) => c.id === selectedClassId);
        return cls ? `parents in "${cls.name}"` : "selected class parents";
      }
      case "program": {
        const prog = programs.find((p) => p.id === selectedProgramId);
        return prog ? `parents in "${prog.name}"` : "selected program parents";
      }
      case "area": {
        const area = areas.find((a) => a.id === selectedAreaId);
        return area ? `parents in "${area.name}"` : "selected area parents";
      }
      default:
        return "selected recipients";
    }
  };

  const handleReset = () => {
    setSubject("");
    setMessage("");
    setSendResult(null);
    setRecipientType("all");
    setSelectedClassId("");
    setSelectedProgramId("");
    setSelectedAreaId("");
  };

  const inputStyle =
    "w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-transparent bg-white font-manrope";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 flex-1 overflow-y-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-[30px] lg:text-[46px] font-bold text-text-primary font-kollektif flex items-center gap-3">
            <Mail className="w-8 h-8 text-btn-gold shrink-0 hidden sm:block" />
            Mass Email
          </h1>
          <p className="text-xs sm:text-sm text-neutral-main font-manrope mt-1">
            Send emails to parents by class, program, area, or all at once
          </p>
        </div>

        {/* Send Result */}
        {sendResult && (
          <div className={`mb-6 p-4 rounded-lg border ${sendResult.failed > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-start gap-3">
              {sendResult.failed > 0 ? (
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="font-semibold font-manrope text-sm text-gray-800">
                  Email Sent
                </h3>
                <p className="text-sm font-manrope text-gray-600 mt-1">
                  {sendResult.successful} of {sendResult.total_recipients} emails sent successfully.
                  {sendResult.failed > 0 && ` ${sendResult.failed} failed.`}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-3 text-sm font-semibold text-[#173151] underline font-manrope"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          </div>
        )}

        {!sendResult && (
          <div className="space-y-6">
            {/* Recipient Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-base font-semibold font-manrope text-text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-btn-gold" />
                Recipients
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {RECIPIENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setRecipientType(type.value);
                      setSelectedClassId("");
                      setSelectedProgramId("");
                      setSelectedAreaId("");
                    }}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      recipientType === type.value
                        ? "border-[#F3BC48] bg-[#F3BC48]/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-sm font-manrope text-text-primary">{type.label}</p>
                    <p className="text-xs text-text-muted font-manrope mt-0.5">{type.description}</p>
                  </button>
                ))}
              </div>

              {/* Dynamic dropdown based on recipient type */}
              {recipientType === "class" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 font-manrope">Select Class *</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className={inputStyle}
                    disabled={loadingOptions}
                  >
                    <option value="">
                      {loadingOptions ? "Loading classes..." : "Choose a class"}
                    </option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientType === "program" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 font-manrope">Select Program *</label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className={inputStyle}
                    disabled={loadingOptions}
                  >
                    <option value="">
                      {loadingOptions ? "Loading programs..." : "Choose a program"}
                    </option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientType === "area" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 font-manrope">Select Area *</label>
                  <select
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    className={inputStyle}
                    disabled={loadingOptions}
                  >
                    <option value="">
                      {loadingOptions ? "Loading areas..." : "Choose an area"}
                    </option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Email Composer */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold font-manrope text-text-primary flex items-center gap-2">
                  <Mail className="w-5 h-5 text-btn-gold" />
                  Compose Email
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={!subject.trim() || !hasMessageContent}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#173151] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-manrope disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 font-manrope">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputStyle}
                    placeholder="Email subject line"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 font-manrope mb-1 block">Message *</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#F3BC48] focus-within:border-transparent">
                    <ReactQuill
                      theme="snow"
                      value={message}
                      onChange={setMessage}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Write your message here..."
                      className="mass-email-editor"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="text-sm font-manrope text-text-muted">
                Sending to: <strong className="text-text-primary">{getRecipientLabel()}</strong>
              </div>
              <button
                onClick={handleSend}
                disabled={isSending || !subject.trim() || !hasMessageContent}
                className="flex items-center gap-2 px-6 py-3 bg-[#F3BC48] hover:bg-[#e5a920] text-[#173151] font-semibold rounded-lg transition-colors shadow-sm font-manrope disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="warning"
      />

      {/* Email Preview Modal */}
      {showPreview && (() => {
        const selectedClassName = recipientType === "class"
          ? classes.find((c) => c.id === selectedClassId)?.name
          : null;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowPreview(false)}>
            <div className="bg-[#f3f6fb] rounded-xl max-w-[640px] w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Preview Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg text-heading-dark font-manrope flex items-center gap-1.5 sm:gap-2">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-btn-gold shrink-0" />
                    Email Preview
                  </h3>
                  <p className="text-xs text-text-muted font-manrope mt-0.5">This is how the email will appear to recipients</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              {/* Subject Bar */}
              <div className="px-4 py-2 bg-white border-b border-gray-200">
                <p className="text-xs text-text-muted font-manrope">Subject</p>
                <p className="text-sm font-semibold text-text-primary font-manrope">{subject || "(No subject)"}</p>
              </div>

              {/* Email Render */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                  {/* Header */}
                  <div style={{
                    background: "linear-gradient(135deg, #173151 0%, #1e3a5f 100%)",
                    color: "white",
                    padding: "30px 20px",
                    textAlign: "center",
                    borderRadius: "10px 10px 0 0",
                  }}>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Carolina Soccer Factory</h1>
                    <p style={{ margin: "5px 0 0 0", fontSize: 14, opacity: 0.9 }}>Announcement</p>
                  </div>

                  {/* Content */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    padding: 30,
                    border: "1px solid #dee5f2",
                    borderRadius: "0 0 10px 10px",
                    lineHeight: 1.6,
                    color: "#173151",
                  }}>
                    <p style={{ margin: "0 0 16px 0" }}>Hi <strong>Parent Name</strong>,</p>

                    <div dangerouslySetInnerHTML={{ __html: message }} />

                    {selectedClassName && (
                      <div style={{
                        backgroundColor: "#f3f6fb",
                        padding: 20,
                        margin: "20px 0",
                        borderRadius: 8,
                        borderLeft: "4px solid #F3BC48",
                      }}>
                        <p style={{ margin: 0 }}><strong>Regarding:</strong> {selectedClassName}</p>
                      </div>
                    )}

                    <p style={{ margin: "16px 0 0 0" }}>If you have any questions, please don't hesitate to contact us.</p>
                    <p style={{ margin: "16px 0 0 0" }}>
                      Best regards,<br />
                      <strong>Carolina Soccer Factory Team</strong>
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: "center", marginTop: 30, padding: 20, color: "#666", fontSize: "0.85em" }}>
                    <p style={{ margin: 0 }}>
                      Carolina Soccer Factory<br />
                      <a href="#" style={{ color: "#173151" }} onClick={(e) => e.preventDefault()}>carolinasoccerfactory.com</a>
                    </p>
                    <hr style={{ border: "none", borderTop: "1px solid #dee5f2", margin: "20px 0" }} />
                    <p style={{ margin: 0 }}>
                      This is an automated email. Please do not reply directly to this message.<br />
                      If you have questions, contact us at <a href="#" style={{ color: "#173151" }} onClick={(e) => e.preventDefault()}>info@carolinasoccerfactory.com</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="p-3 sm:p-4 border-t bg-white flex items-center justify-between">
                <p className="text-xs text-text-muted font-manrope">
                  Sending to: <strong className="text-text-primary">{getRecipientLabel()}</strong>
                </p>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-manrope"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quill editor styles */}
      <style>{`
        .mass-email-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 0;
        }
        .mass-email-editor .ql-container {
          border: none;
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          min-height: 200px;
        }
        .mass-email-editor .ql-editor {
          min-height: 200px;
          line-height: 1.6;
          color: #173151;
        }
        .mass-email-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .mass-email-editor .ql-snow .ql-stroke {
          stroke: #6b7280;
        }
        .mass-email-editor .ql-snow .ql-fill {
          fill: #6b7280;
        }
        .mass-email-editor .ql-snow .ql-picker {
          color: #6b7280;
        }
        .mass-email-editor .ql-snow button:hover .ql-stroke,
        .mass-email-editor .ql-snow .ql-picker-label:hover .ql-stroke {
          stroke: #F3BC48;
        }
        .mass-email-editor .ql-snow button:hover .ql-fill,
        .mass-email-editor .ql-snow .ql-picker-label:hover .ql-fill {
          fill: #F3BC48;
        }
        .mass-email-editor .ql-snow button.ql-active .ql-stroke {
          stroke: #F3BC48;
        }
        .mass-email-editor .ql-snow button.ql-active .ql-fill {
          fill: #F3BC48;
        }
      `}</style>
    </div>
  );
}
