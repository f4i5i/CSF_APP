import { X, Edit } from "lucide-react";

export default function StudentDetailsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      
      {/* MODAL BOX */}
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 relative animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Anton G.</h2>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm text-gray-700">
              <Edit size={16} />
              Edit
            </button>
            <button onClick={onClose} className="border border-[#DFE1E7] rounded-full p-2">
              <X size={12} className="text-[#0D0D12] " />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col gap-5">

          {/* CONTACT INFO */}
          <Section title="Contact Information">
            <Field label="Parent/Guardian :" value="Maria Garcia" />
            <Field label="Phone :" value="(555) 123-4567" />
            <Field label="Email :" value="maria.garcia@email.com" />
          </Section>

          {/* MEDICAL INFO */}
          <Section title="Medical Information">
            <Field label="Allergies :" value="None" />
            <Field label="Conditions :" value="None" />
          </Section>

          {/* AFTER SCHOOL */}
          <Section title="After School">
            <Field value="Yes" />
          </Section>

          {/* NOTES */}
          <Section title="Additional Notes">
            <div className="w-full p-3 rounded-xl border bg-gray-50 text-sm text-gray-700">
              Advanced skills, consider moving to competitive team
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- REUSABLE SECTION ---------- */

function Section({ title, children }) {
  return (
    <div>
      <p className="text-sm font-medium mb-2 text-gray-700">{title}</p>
      <div className="bg-white border rounded-xl p-4 flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

/* ---------- REUSABLE FIELD ---------- */

function Field({ label, value }) {
  return (
    <div className="text-sm text-gray-700 flex gap-3">
      <span className="font-medium">{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
