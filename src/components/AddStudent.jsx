import React, { useState } from "react";
import Header from "./Header";

const AddStudent = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    age: "",
    parentName: "",
    phone: "",
    email: "",
    classId: "",
  });

  const classes = [
    { id: 1, name: "Class A" },
    { id: 2, name: "Class B" },
    { id: 3, name: "Class C" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Student Registration Successful!");
  };

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />

      <main className="mx-10 py-6 flex justify-center items-center max-sm:py-2 max-sm:mx-3">
    
      <div className="bg-[#FFFFFF50] shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Add New Student
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Student Name */}
           <div className="grid grid-cols-1  md:grid-cols-2 gap-6 mt-10">

          <div>
            <label className="text-gray-600 font-medium">Student Name</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="text-gray-600 font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Parent Name */}
          <div>
            <label className="text-gray-600 font-medium">Parent Name</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-600 font-medium">Parent Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-600 font-medium">Parent Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* Class Select */}
          <div>
            <label className="text-gray-600 font-medium">Select Class</label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="">Choose Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
</div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            Register Student
          </button>

        </form>
      </div>
      </main>
    </div>
  );
};

export default AddStudent;
