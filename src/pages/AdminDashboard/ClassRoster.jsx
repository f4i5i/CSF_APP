import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, User, Mail, Phone, ArrowLeft, Loader2, Copy, CheckCircle, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../api/services/admin.service';

const ClassRoster = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rosterData, setRosterData] = useState(null);
  const [error, setError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        setLoading(true);
        const data = await adminService.getClassRoster(classId);
        setRosterData(data);
      } catch (err) {
        console.error('Failed to fetch roster:', err);
        setError(err.response?.data?.detail || 'Failed to load class roster');
        toast.error('Failed to load class roster');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchRoster();
    }
  }, [classId]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      toast.success('Roster link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const students = rosterData?.students || rosterData?.enrollments || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-btn-gold" />
          <span className="text-text-muted font-manrope text-lg">Loading roster...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700 font-manrope mb-2">Unable to Load Roster</h2>
          <p className="text-text-muted font-manrope mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-btn-gold text-white rounded-lg hover:bg-btn-gold/90 transition-colors font-manrope"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
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
              {rosterData.program_name && <span>Program: <strong>{rosterData.program_name}</strong></span>}
              {rosterData.school_name && <span>Site: <strong>{rosterData.school_name}</strong></span>}
              {rosterData.start_date && rosterData.end_date && (
                <span>{new Date(rosterData.start_date).toLocaleDateString()} - {new Date(rosterData.end_date).toLocaleDateString()}</span>
              )}
            </div>
          )}

          {/* Share Link */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
              <Link className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-blue-800 font-manrope">Share:</span>
              <span className="text-xs sm:text-sm text-blue-600 truncate font-mono">{window.location.href}</span>
            </div>
            <button
              onClick={copyShareLink}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 w-full sm:w-auto ${
                linkCopied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {linkCopied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Roster Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {students.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-text-muted font-manrope">No students enrolled in this class</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-primary font-manrope">
                {students.length} Student{students.length !== 1 ? 's' : ''} Enrolled
              </p>
            </div>

            <div className="grid gap-3">
              {students.map((student, idx) => {
                // Handle both flat (backend) and nested response structures
                const childName = student.child_name || `${student.child?.first_name || student.first_name || ''} ${student.child?.last_name || student.last_name || ''}`.trim();
                const childAge = student.child_age ?? student.child?.age;
                const childDob = student.child_dob || student.child?.date_of_birth;
                const childGrade = student.child?.grade || student.grade;
                const parentName = student.parent_name || `${student.parent?.first_name || ''} ${student.parent?.last_name || ''}`.trim() || student.parent?.full_name;
                const parentEmail = student.parent_email || student.parent?.email;
                const parentPhone = student.parent_phone || student.parent?.phone;
                const enrollmentStatus = student.enrollment_status || student.enrollment?.status || student.status;
                const studentId = student.child_id || student.child?.id || student.enrollment_id || idx;

                return (
                  <div
                    key={studentId}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-btn-gold/20 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-btn-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-text-primary font-manrope text-sm sm:text-base truncate">
                              {childName || 'Unknown Student'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm text-text-muted font-manrope">
                              {(childAge != null || childDob) && (
                                <span>Age: {childAge ?? (new Date().getFullYear() - new Date(childDob).getFullYear())}</span>
                              )}
                              {childGrade && <span>Grade {childGrade}</span>}
                            </div>
                          </div>
                          {enrollmentStatus && (
                            <span className={`px-2 py-1 text-xs rounded-full font-medium shrink-0 ${
                              enrollmentStatus === 'ACTIVE' || enrollmentStatus === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {enrollmentStatus}
                            </span>
                          )}
                        </div>

                        {/* Parent Info */}
                        {(parentName || parentEmail || parentPhone) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-medium text-text-muted mb-1 font-manrope">Parent/Guardian</p>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-text-primary font-manrope">
                              {parentName && <span className="font-medium">{parentName}</span>}
                              {parentEmail && (
                                <span className="flex items-center gap-1 text-text-muted truncate">
                                  <Mail className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{parentEmail}</span>
                                </span>
                              )}
                              {parentPhone && (
                                <span className="flex items-center gap-1 text-text-muted">
                                  <Phone className="w-3.5 h-3.5 shrink-0" />
                                  {parentPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRoster;
