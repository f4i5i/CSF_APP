/**
 * Marketing Compose & Send
 * Compose a marketing email (rich text + attachments) and send it to a saved
 * segment or a filter passed from the Contacts page. Shows a live count of
 * eligible recipients (unsubscribed contacts are always excluded server-side).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Send, Paperclip, X, Users } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../../../components/Header";
import marketingService from "../../../api/services/marketing.service";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

export default function MarketingCompose() {
  const location = useLocation();
  const navigate = useNavigate();
  const incomingFilters = location.state?.filters || [];

  const [segments, setSegments] = useState([]);
  const [segmentId, setSegmentId] = useState(location.state?.segmentId || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [count, setCount] = useState(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  // Audience is either the incoming filter (from Contacts) or a chosen segment.
  const usingIncomingFilter = incomingFilters.length > 0 && !segmentId;

  useEffect(() => {
    marketingService
      .getSegments()
      .then((res) => setSegments(res.data || []))
      .catch(() => {});
  }, []);

  const audiencePayload = useMemo(() => {
    if (segmentId) return { segment_id: segmentId };
    if (incomingFilters.length) {
      const specs = incomingFilters.map((chip) => {
        const [field, op, ...rest] = chip.split(":");
        return { field, op, value: rest.join(":") || null };
      });
      return { filters: specs };
    }
    return { filters: [] };
  }, [segmentId, incomingFilters]);

  // Live recipient count.
  useEffect(() => {
    let active = true;
    marketingService
      .previewCount(audiencePayload)
      .then((res) => active && setCount(res.count))
      .catch(() => active && setCount(null));
    return () => {
      active = false;
    };
  }, [audiencePayload]);

  const addFiles = (files) => {
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (!subject.trim()) return toast.error("Subject is required");
    if (!body || body === "<p><br></p>") return toast.error("Body is required");
    if (!count) return toast.error("No eligible recipients");
    if (
      !window.confirm(
        `Send this email to ${count} recipient(s)? This cannot be undone.`,
      )
    )
      return;

    setSending(true);
    try {
      const res = await marketingService.send({
        subject: subject.trim(),
        html_body: body,
        segment_id: segmentId || undefined,
        filters: segmentId ? [] : incomingFilters,
        attachments,
      });
      toast.success(
        `Sent to ${res.sent_count} recipient(s)` +
          (res.failed_count ? `, ${res.failed_count} failed` : ""),
      );
      navigate("/admin/marketing/sends");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl">
        <h1 className="text-2xl font-bold font-kollektif text-text-primary">
          Compose Email
        </h1>

        {/* Audience */}
        <div className="bg-white/70 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Users className="w-4 h-4" /> Audience
          </div>
          {usingIncomingFilter ? (
            <p className="text-sm text-gray-600">
              Filtered audience from Contacts ({incomingFilters.length} filter
              {incomingFilters.length === 1 ? "" : "s"}).
            </p>
          ) : (
            <select
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg text-sm bg-white focus:ring-2 focus:ring-btn-gold"
            >
              <option value="">All contacts</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <p className="text-sm">
            <span className="font-semibold text-[#173963]">
              {count == null ? "…" : count}
            </span>{" "}
            eligible recipient(s){" "}
            <span className="text-gray-400">
              (unsubscribed contacts excluded)
            </span>
          </p>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-btn-gold"
            placeholder="Your subject line"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Message
          </label>
          <div className="bg-white rounded-lg">
            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              modules={QUILL_MODULES}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            An unsubscribe link + mailing address are appended automatically to
            every email (required by law).
          </p>
        </div>

        {/* Attachments */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-text-primary bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Paperclip className="w-4 h-4" /> Attach files
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>
          {attachments.length > 0 && (
            <ul className="space-y-1">
              {attachments.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm text-gray-700 bg-white/70 rounded px-3 py-1.5"
                >
                  {f.name}
                  <button onClick={() => removeFile(i)}>
                    <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Send */}
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending || !count}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#173963] rounded-lg hover:bg-[#12305a] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending…" : `Send to ${count ?? 0}`}
          </button>
        </div>
      </div>
    </div>
  );
}
