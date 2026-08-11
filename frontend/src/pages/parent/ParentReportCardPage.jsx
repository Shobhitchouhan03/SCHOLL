import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import ChildSelector from '../../components/parent/ChildSelector';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Printer, GraduationCap, Award, FileText, CheckCircle2, Calendar } from 'lucide-react';

const ParentReportCardPage = () => {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [reportCardData, setReportCardData] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent/me');
      if (res.data.success) {
        const kids = res.data.children || [];
        setChildrenList(kids);
        if (kids.length > 0) setSelectedChildId(kids[0]._id);
      }
    } catch (err) {
      console.error('Fetch children error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportCard = async (childId, sessionId) => {
    if (!childId) return;
    try {
      setLoading(true);
      const res = await api.get(`/parent/children/${childId}/report-card`, {
        params: { sessionId },
      });
      if (res.data.success) {
        setReportCardData(res.data);
      }
    } catch (err) {
      console.error('Fetch report card error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchReportCard(selectedChildId, selectedSessionId);
    }
  }, [selectedChildId, selectedSessionId]);

  const handlePrint = () => {
    window.print();
  };

  const student = reportCardData?.student || {};
  const reportCard = reportCardData?.reportCard || {};
  const availableSessions = reportCardData?.availableSessions || [];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Printable Area - Hide Header & Sidebar during print */}
      <div className="print:hidden">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      </div>

      <div className="flex flex-1">
        <div className="print:hidden">
          <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6 print:p-0 print:max-w-none">
          {/* Header Banner - Screen Only */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Portal</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Official Academic Report Card
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                View subject performance breakdown, attendance summary, and print official report cards.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {availableSessions.length > 1 && (
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut cursor-pointer"
                >
                  <option value="">Current Session</option>
                  {availableSessions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report Card</span>
              </button>
            </div>
          </div>

          <div className="print:hidden">
            <ChildSelector
              childrenList={childrenList}
              selectedChildId={selectedChildId}
              onSelectChild={(id) => setSelectedChildId(id)}
            />
          </div>

          {loading ? (
            <LoadingSkeleton count={4} />
          ) : (
            /* OFFICIAL REPORT CARD LAYOUT (Screen & Print Friendly) */
            <div className="bg-white rounded-3xl p-8 border border-almond/40 shadow-card space-y-6 print:border-none print:shadow-none print:p-4">
              {/* Report Header */}
              <div className="text-center pb-6 border-b-2 border-chestnut space-y-1">
                <h2 className="text-2xl font-black text-darkBrown tracking-tight uppercase">
                  ACADEMIC PERFORMANCE REPORT
                </h2>
                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">
                  Academic Session: {student.currentAcademicSessionId?.name || '2026-2027'}
                </p>
              </div>

              {/* Student Info Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface/60 p-4 rounded-2xl border border-almond/30 text-xs">
                <div>
                  <span className="text-textMuted font-medium block">Student Name</span>
                  <span className="font-bold text-darkBrown text-sm">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-textMuted font-medium block">Admission Number</span>
                  <span className="font-bold text-darkBrown font-mono">{student.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-textMuted font-medium block">Class & Section</span>
                  <span className="font-bold text-darkBrown">{student.currentClassId?.name} - {student.currentSectionId?.name}</span>
                </div>
                <div>
                  <span className="text-textMuted font-medium block">Roll Number</span>
                  <span className="font-bold text-darkBrown">{student.rollNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-darkBrown uppercase tracking-wider">Subject Performance Breakdown</h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-chestnut/10 text-darkBrown font-bold border-b border-almond/40">
                      <th className="py-2.5 px-3">Subject Name</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Marks Obtained</th>
                      <th className="py-2.5 px-3">Max Marks</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Result Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-darkBrown">
                    {(reportCard.subjectBreakdown || []).map((sb, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-bold">{sb.subject}</td>
                        <td className="py-2.5 px-3 font-mono text-textMuted">{sb.code || '—'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-chestnut">{sb.marksObtained}</td>
                        <td className="py-2.5 px-3 font-mono text-textMuted">{sb.maxMarks}</td>
                        <td className="py-2.5 px-3 font-extrabold">{sb.grade}</td>
                        <td className="py-2.5 px-3">
                          <span className={`font-bold ${sb.isPassed ? 'text-success' : 'text-danger'}`}>
                            {sb.isPassed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Overall Performance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-almond/30">
                <div className="p-4 bg-surface rounded-2xl border border-almond/30 space-y-1">
                  <span className="text-[10px] font-bold text-textMuted uppercase">Aggregate Total</span>
                  <div className="text-lg font-black text-darkBrown font-mono">
                    {reportCard.totalObtained || 0} / {reportCard.totalMax || 0}
                  </div>
                  <span className="text-xs font-bold text-chestnut">Percentage: {reportCard.percentage || 0}%</span>
                </div>

                <div className="p-4 bg-surface rounded-2xl border border-almond/30 space-y-1">
                  <span className="text-[10px] font-bold text-textMuted uppercase">Overall Grade & Status</span>
                  <div className="text-lg font-black text-darkBrown">
                    Grade {reportCard.overallGrade || 'F'}
                  </div>
                  <span className="text-xs font-bold text-success">{reportCard.promotionStatus || 'Promoted'}</span>
                </div>

                <div className="p-4 bg-surface rounded-2xl border border-almond/30 space-y-1">
                  <span className="text-[10px] font-bold text-textMuted uppercase">Attendance Record</span>
                  <div className="text-lg font-black text-darkBrown font-mono">
                    {reportCard.attendanceSummary?.percentage || 100}%
                  </div>
                  <span className="text-xs text-textMuted">
                    {reportCard.attendanceSummary?.present || 0} Days Attended
                  </span>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="p-4 bg-morning/10 rounded-2xl border border-morning/30 text-xs">
                <span className="font-bold text-darkBrown block mb-0.5">Teacher & Principal Remarks:</span>
                <p className="text-textMuted italic">{reportCard.teacherRemarks}</p>
              </div>

              {/* Signature Footer */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-darkBrown font-bold">
                <div className="border-t border-darkBrown/40 pt-2">Class Teacher Signature</div>
                <div className="border-t border-darkBrown/40 pt-2">Principal Signature & Seal</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentReportCardPage;
