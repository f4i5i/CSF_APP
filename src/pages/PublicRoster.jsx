import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Users, User, Loader2 } from "lucide-react";
import publicService from "../api/services/public.service";

const PublicRoster = () => {
  const { shareToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [rosterData, setRosterData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        setLoading(true);
        const data = await publicService.getPublicRoster(shareToken);
        setRosterData(data);
      } catch (err) {
        console.error("Failed to fetch public roster:", err);
        setError(
          err.response?.data?.detail || "This roster link is invalid or expired"
        );
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchRoster();
    }
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-btn-gold" />
          <span className="text-text-muted font-manrope text-lg">
            Loading roster...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700 font-manrope mb-2">
            Roster Unavailable
          </h2>
          <p className="text-text-muted font-manrope">{error}</p>
        </div>
      </div>
    );
  }

  const students = rosterData?.students || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-heading-dark font-manrope flex items-center gap-2">
                <Users className="w-6 h-6 text-btn-gold shrink-0" />
                Class Roster
              </h1>
              {rosterData?.class_name && (
                <p className="text-sm text-text-muted font-manrope mt-1 truncate">
                  {rosterData.class_name}
                </p>
              )}
            </div>
          </div>

          {/* Class Info */}
          {rosterData && (
            <div className="flex flex-wrap gap-4 text-sm text-text-muted font-manrope mt-2">
              {rosterData.program_name && (
                <span>
                  Program: <strong>{rosterData.program_name}</strong>
                </span>
              )}
              {rosterData.school_name && (
                <span>
                  Site: <strong>{rosterData.school_name}</strong>
                </span>
              )}
              {rosterData.start_date && rosterData.end_date && (
                <span>
                  {new Date(rosterData.start_date).toLocaleDateString()} –{" "}
                  {new Date(rosterData.end_date).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Roster Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {students.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-text-muted font-manrope">
              No students enrolled in this class
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-primary font-manrope">
                {students.length} Student{students.length !== 1 ? "s" : ""}{" "}
                Enrolled
              </p>
            </div>

            <div className="grid gap-3">
              {students.map((student, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-btn-gold/20 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-btn-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text-primary font-manrope text-sm sm:text-base truncate">
                        {student.child_name || "Student"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm text-text-muted font-manrope">
                        {student.child_age != null && (
                          <span>Age: {student.child_age}</span>
                        )}
                        {student.child_grade && (
                          <span>Grade {student.child_grade}</span>
                        )}
                        {student.classroom_teacher && (
                          <span>Teacher: {student.classroom_teacher}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRoster;
