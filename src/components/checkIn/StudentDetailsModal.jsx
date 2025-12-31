import { X, Edit } from "lucide-react";

export default function StudentDetailsModal({ student, onClose }) {
  // Extract student data with fallbacks
  const studentName = student?.name || 'Unknown Student';
  const parentName = student?.parent?.first_name
    ? `${student.parent.first_name} ${student.parent.last_name || ''}`
    : student?.child?.parent_name || 'Not provided';
  const parentPhone = student?.parent?.phone || student?.child?.parent_phone || 'Not provided';
  const parentEmail = student?.parent?.email || student?.child?.parent_email || 'Not provided';
  const allergies = student?.medical_info?.allergies || student?.child?.allergies || 'None';
  const conditions = student?.medical_info?.conditions || student?.child?.medical_conditions || 'None';
  const afterSchool = student?.child?.after_school ? 'Yes' : 'No';
  const notes = student?.notes || student?.child?.notes || 'No additional notes';

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4">

      {/* MODAL BOX */}
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg relative animate-fadeIn">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-light">
          <h2 className="font-semibold font-manrope text-lg text-nuetral-200">{studentName}</h2>

          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center w-[98px] shadow-sm h-12 text-[#2E2E37] font-semibold gap-3 px-3 py-1.5 border border-border-light rounded-lg text-lg text-gray-700">
              <Edit size={20} />
              Edit
            </button>
            <button onClick={onClose} className="border flex items-center justify-center border-[#DFE1E7] w-10 h-10 rounded-full p-2">
              <X size={20} className="text-[#0D0D12] font-bold" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col gap-5 px-6 py-4 mb-2">

          {/* CONTACT INFO */}
          <Section title="Contact Information">
            <Field label="Parent/Guardian :" value={parentName} />
            <Field label="Phone :" value={parentPhone} />
            <Field label="Email :" value={parentEmail} />
          </Section>

          {/* MEDICAL INFO */}
          <Section title="Medical Information">
            <Field label="Allergies :" value={allergies} />
            <Field label="Conditions :" value={conditions} />
          </Section>

          {/* AFTER SCHOOL */}
          <Section title="After School">
            <Field value={afterSchool} />
          </Section>

          {/* NOTES */}
          <Section className="h-[131px]" title="Additional Notes">
            <p>{notes}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- REUSABLE SECTION ---------- */

function Section({ title, children, className }) {
  return (
    <div>
      <p className="text-sm font-normal mb-2 text-text-body font-manrope">{title}</p>
      <div className={`bg-white border rounded-xl p-4 flex flex-col gap-2 ${className}`}>
        {children}
      </div>
    </div>
  );
}

/* ---------- REUSABLE FIELD ---------- */

function Field({ label, value }) {
  return (
    <div className="text-sm flex font-manrope">
      {label && <span className="font-medium text-[#6B7280]">{label}</span>}
      <span className="text-heading-dark">{value}</span>
    </div>
  );
}
