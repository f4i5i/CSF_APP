import StudentCard from "./StudentCard";
import { ChevronDown } from "lucide-react";

const StudentList = ({ students, search, sort, setSort, onOpen }) => {
  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white/60 p-4 rounded-3xl shadow-md backdrop-blur-md border">
      {/* HEADER */}
      <div className="flex justify-between  items-center mb-3">
        <h2 className="font-semibold text-lg font-manrope text-[#1B1B1B]">
          Students ({filtered.filter((s) => s.checked).length}/{filtered.length})
        </h2>

        <button className="flex items-center  gap-2 bg-[#FFFFFF80] px-4 py-2 rounded-full shadow text-sm">
          {sort} <ChevronDown size={16} />
        </button>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-3">
        {filtered.map((student) => (
          <StudentCard key={student.id} student={student}  onOpenModal={onOpen}/>
        ))}
      </div>
    </div>
  );
};

export default StudentList;
