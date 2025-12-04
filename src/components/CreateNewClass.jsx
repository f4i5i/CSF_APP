import React from "react";

export default function CreateNewClass() {
  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 flex justify-center">
      <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-6">Create New Class</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold">Program</label>
            <select className="w-full p-2 border rounded-lg mt-1">
              <option>CSF School Academy</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Location</label>
            <input className="w-full p-2 border rounded-lg mt-1" placeholder="Charlotte" />
          </div>

          <div>
            <label className="font-semibold">Class Name</label>
            <input className="w-full p-2 border rounded-lg mt-1" placeholder="Mint Hill Elementary" />
          </div>

          <div>
            <label className="font-semibold">Ledger Code</label>
            <select className="w-full p-2 border rounded-lg mt-1">
              <option>100 - School Academy Charlotte</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="font-semibold">Class Visibility</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2"><input type="radio" /> Normal</label>
            <label className="flex items-center gap-2"><input type="radio" /> Hidden</label>
          </div>
        </div>

        <div className="mt-6">
          <label className="font-semibold">Class Description</label>
          <textarea className="w-full p-2 border rounded-lg mt-1 h-24"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="font-semibold">Registration Start Date</label>
            <input type="date" className="w-full p-2 border rounded-lg mt-1" />
          </div>

          <div>
            <label className="font-semibold">Registration End Date</label>
            <input type="date" className="w-full p-2 border rounded-lg mt-1" />
          </div>
        </div>

        <div className="mt-6">
          <label className="font-semibold">Class Schedule</label>
          <input className="w-full p-2 border rounded-lg mt-1" placeholder="Monthly calendar view to de-select days/holidays" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="font-semibold">Day & Time</label>
            <select className="w-full p-2 border rounded-lg mt-1">
              <option>Weekday</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Start Time</label>
            <input type="time" className="w-full p-2 border rounded-lg mt-1" />
          </div>

          <div>
            <label className="font-semibold">End Time</label>
            <input type="time" className="w-full p-2 border rounded-lg mt-1" />
          </div>
        </div>

        <div className="mt-6">
          <label className="font-semibold">Recurrence</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <button className="p-2 border rounded-lg">Weekly</button>
            <button className="p-2 border rounded-lg">Monthly</button>
            <button className="p-2 border rounded-lg">One Time</button>
            <input className="p-2 border rounded-lg" placeholder="Repeat every X weeks" />
          </div>
        </div>

        <div className="mt-6">
          <label className="font-semibold">Class Type</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2"><input type="radio" /> One Time Session</label>
            <label className="flex items-center gap-2"><input type="radio" /> Membership</label>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold">Price</label>
            <input className="w-full p-2 border rounded-lg mt-1" placeholder="$199" />
          </div>

          <div>
            <label className="font-semibold">Payment Plan / Membership</label>
            <input className="w-full p-2 border rounded-lg mt-1" placeholder="Jan / Feb / March / Apr ..." />
          </div>
        </div>

        <div className="mt-6">
          <label className="font-semibold">Registration Slots</label>
          <input className="w-full p-2 border rounded-lg mt-1" placeholder="40" />
        </div>

        <div className="mt-6">
          <label className="font-semibold">Class Image / Logo</label>
          <input type="file" className="w-full p-2 border rounded-lg mt-1" />
        </div>

        <div className="mt-6">
          <label className="font-semibold">Class Link</label>
          <div className="flex gap-4 mt-1">
            <input className="w-full p-2 border rounded-lg" placeholder="Class link..." />
            <button className="px-4 py-2 bg-gray-200 rounded-lg">Copy</button>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">Create Class</button>
        </div>
      </div>
    </div>
  );
}
