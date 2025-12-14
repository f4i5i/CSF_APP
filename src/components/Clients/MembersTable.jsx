import React, { useMemo, useState } from "react";
import Pagination from "./Pagination";
import ExportButton from "./ExportButton";
import BadgeCard from "../../components/attendence/BadgeCard";
import icon1 from "../../assets/Mask group.png"
import icon2 from '../../assets/Mask group (1).png'
import icon3 from '../../assets/Mask group (2).png'
import icon4 from '../../assets/Mask group (3).png'
import icon5 from '../../assets/Mask group (4).png'
 const badges = [
    {id:1,  title: "Perfect Attendance", icon: icon1 },
    {id:2,  title: "Leadership", icon: icon2 },
    {id:3,  title: "Star Performer", icon: icon3 },
    {id:4,
      title: "Quick Learner",
      subtitle: "Achieved: Sep 28, 2024",
      icon: icon5,
      active: true,
    },
    {id:5, title: "Team Player", icon: icon4 },
     {id:6, title: "Team Player", icon: icon5 },
 
  ];
/**
 * Members table follows same column order as Accounts
 */
export default function MembersTable({ data = [], allData = [] }) {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
 const [showFormAccount, setShowFormAccount] = useState(null);
 const [openMember, setOpenMember] = useState(null);
 
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleAll = () => {
    if (selected.length === pageData.length) setSelected([]);
    else setSelected(pageData.map((r) => r.id));
  };

  return (
    <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow overflow-hidden font-manrope">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={selected.length === pageData.length && pageData.length > 0}
              onChange={toggleAll}
            />
            <span className="font-manrope text-sm text-gray-700">Select page</span>
          </label>
          <div className="text-sm text-gray-500 font-manrope">{total} members</div>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="border px-2 py-1 rounded text-sm font-manrope"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={8}>8 / page</option>
            <option value={16}>16 / page</option>
            <option value={32}>32 / page</option>
          </select>

          <ExportButton itemsToExport={selected.length ? selected : null} allData={allData} />
        </div>
      </div>

      <div className="w-full overflow-auto">
        <table className="min-w-[960px] w-full table-auto border-separate border-spacing-0 font-manrope">
          <thead className="sticky top-0 bg-[#FFFFFF80] z-10 font-manrope">
            <tr>
              <th className="p-3 text-left" />
              <th className="p-3 text-left">Last name</th>
              <th className="p-3 text-left">First name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Account status</th>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Reg date</th>
               <th className="p-3 text-left">DOB</th>
              <th className="p-3 text-left">Shirt Size</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageData.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 even:bg-gray-50/50 transition font-manrope">
                <td className="p-3">
                  <input type="checkbox" className="w-4 h-4" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                </td>

                <td className="p-3">{r.lastName}</td>
                <td className="p-3">{r.firstName}</td>
                <td className="p-3 font-manrope text-sm text-gray-700">{r.email}</td>
                <td className="p-3 text-sm">{r.phone}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3">{r.class}</td>
                <td className="p-3">{formatDate(r.reg_date)}</td>
                 <td className="p-3">{r.dob}</td>
                <td className="p-3">{r.jerseySize}</td>
               
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button  onClick={() => setShowFormAccount(r.id)}  className="px-3 py-1 text-sm rounded bg-white border">Edit</button>
                    <button onClick={() => setOpenMember(r.id)} className="px-3 py-1 text-sm rounded bg-[#E6F2FF] text-[#0F66B6]">Assign Badge</button>
                  </div>

                </td>
                 {/* Inline Edit Drawer (mobile-friendly) */}
            {showFormAccount === r.id && (
              <MemberEditDrawer account={r} onClose={() => setShowFormAccount(null)} />
            )}
             {openMember === r.id && (
              <AssignBadge m={r} onClose={() => setOpenMember(null)} />
            )}
              </tr>
            ))}

            {pageData.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-500 font-manrope">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Pagination page={page} setPage={setPage} pages={Math.max(1, Math.ceil(total / pageSize))} />
        <div className="text-sm text-gray-500">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</div>
      </div>
    </div>
  );
}

/* helpers */
function StatusBadge({ status }) {
  const cls =
    status === "Active"
      ? "bg-green-100 text-green-800"
      : status === "Inactive"
      ? "bg-gray-100 text-gray-700"
      : "bg-yellow-100 text-yellow-800";
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}
function formatDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

function MemberEditDrawer({ account, onClose }) {
  const [form, setForm] = useState({
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    phone: account.phone,
    class: account.class,
    reg_date: account.reg_date,
    dob: account.dob,
    jersey_size: account.jersey_size,
    status: account.status
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">Edit Account — {account.id}</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        {/* FORM */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* FIRST NAME */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 font-manrope ">First Name</label>
            <input
              className="border p-2 rounded font-manrope"
              value={form.firstName}
              onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
            />
          </div>

          {/* LAST NAME */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 font-manrope">Last Name</label>
            <input
              className="border p-2 rounded font-manrope"
              value={form.lastName}
              onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium mb-1 font-manrope">Email</label>
            <input
              className="border p-2 rounded font-manrope"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            />
          </div>

          {/* PHONE */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 font-manrope">Phone</label>
            <input
              className="border p-2 rounded font-manrope"
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>

          {/* CLASS */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 font-manrope">Class</label>
            <input
              className="border p-2 rounded font-manrope"
              value={form.class}
              onChange={(e) => setForm((s) => ({ ...s, class: e.target.value }))}
            />
          </div>

          {/* REG DATE */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 font-manrope">Registration Date</label>
            <input
              type="date"
              className="border p-2 rounded font-manrope"
              value={form.reg_date}
              onChange={(e) => setForm((s) => ({ ...s, reg_date: e.target.value }))}
            />
          </div>

          {/* DOB */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 font-manrope">Date of Birth</label>
            <input
              type="date"
              className="border p-2 rounded font-manrope"
              value={form.dob}
              onChange={(e) => setForm((s) => ({ ...s, dob: e.target.value }))}
            />
          </div>

          {/* JERSEY SIZE */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 font-manrope">Jersey Size</label>
            <input
              className="border p-2 rounded font-manrope"
              value={form.jersey_size}
              onChange={(e) => setForm((s) => ({ ...s, jersey_size: e.target.value }))}
            />
          </div>

          {/* STATUS */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 font-manrope">Account Status</label>
            <select
              className="border p-2 rounded font-manrope"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-[#F3BC48] text-white hover:bg-[#e2a73f]"
            >
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


function AssignBadge({ m, onClose }) {
     const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl p-5">

        <h3 className="text-lg font-semibold mb-4">Assign Badge</h3>

        {/* BADGES GRID */}
        <div className="grid grid-cols-2 gap-4">
          {badges.map(badge => (
            <div key={badge.id} onClick={() => setSelectedBadge(badge.id)}>
              <BadgeCard
                title={badge.title}
                subtitle={badge.subtitle}
                icon={badge.icon}
                compact={true}
                active={selectedBadge === badge.id}  // 💥 THIS CONTROLS BORDER
              />
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-5">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            onClick={() => console.log("Assigned badge:", selectedBadge)}
            className="px-4 py-2 bg-[#1D3557] text-white rounded"
          >
            Assign
          </button>
        </div>

      </div>
    </div>
  );
}
