import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Printer, ArrowLeft, Award, ShieldCheck } from 'lucide-react';

const ReportCardPage = () => {
  const { studentId, resultId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/parent/children/${studentId}/results`);
      if (res.data.success && res.data.results?.length > 0) {
        const target = resultId ? res.data.results.find((r) => r._id === resultId) || res.data.results[0] : res.data.results[0];
        setResult(target);
      }
    } catch (err) {
      console.error('Fetch report card result error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [studentId, resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-surface p-8 text-center text-textMuted text-xs">
        No published report card found for this student.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col print:bg-white print:p-0">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 print:p-0 print:m-0 print:max-w-none">
        {/* Print Controls (Hidden on Print) */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report Card</span>
          </button>
        </div>

        {/* Printable Official Report Card Document */}
        <div className="bg-white rounded-3xl p-8 border border-almond/50 shadow-2xl space-y-6 print:shadow-none print:border-none print:p-4">
          {/* Header Branding */}
          <div className="text-center pb-6 border-b-2 border-chestnut space-y-1">
            <h1 className="text-3xl font-black text-darkBrown tracking-tight uppercase">
              Official Progress Report Card
            </h1>
            <p className="text-xs font-bold text-chestnut tracking-widest uppercase">
              {result.examId?.name || 'Academic Assessment 2026'}
            </p>
          </div>

          {/* Student Demographics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface rounded-2xl border border-almond/40 text-xs">
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Student Name</span>
              <span className="font-bold text-darkBrown">{result.studentId?.fullName || 'Rahul Sharma'}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Admission No</span>
              <span className="font-mono font-bold text-chestnut">{result.studentId?.admissionNumber || 'ADM2026'}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Class & Section</span>
              <span className="font-bold text-darkBrown">{result.classId?.name} - {result.sectionId?.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Academic Session</span>
              <span className="font-semibold text-darkBrown">2026-2027</span>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-almond/40 rounded-xl">
              <thead>
                <tr className="border-b border-almond/40 text-[11px] font-bold text-darkBrown uppercase tracking-wider bg-surface">
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4 text-center">Marks Obtained</th>
                  <th className="py-3 px-4 text-center">Max Marks</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                {(result.subjectResults || []).map((sub, idx) => (
                  <tr key={idx} className="hover:bg-surface/30">
                    <td className="py-3 px-4 font-bold text-darkBrown">{sub.subjectName}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-chestnut">{sub.obtainedMarks}</td>
                    <td className="py-3 px-4 text-center font-mono">{sub.maximumMarks}</td>
                    <td className="py-3 px-4 text-center font-semibold">{sub.percentage}%</td>
                    <td className="py-3 px-4 text-center font-bold text-darkBrown">{sub.grade}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sub.passStatus === 'pass' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {sub.passStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-surface rounded-2xl border border-almond/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-bold text-darkBrown text-sm">
                Total Obtained: <span className="text-chestnut">{result.totalObtainedMarks}</span> / {result.totalMaximumMarks}
              </div>
              <div className="text-textMuted">Overall Percentage: <strong className="text-darkBrown">{result.percentage}%</strong></div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-textMuted uppercase block">Overall Grade</span>
                <span className="text-xl font-black text-chestnut">{result.overallGrade}</span>
              </div>

              <span className={`px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider ${result.resultStatus === 'pass' ? 'bg-success text-white shadow-md' : 'bg-danger text-white shadow-md'}`}>
                RESULT: {result.resultStatus}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 flex justify-between items-end text-xs text-textMuted">
            <div className="text-center">
              <div className="w-32 border-b border-darkBrown mb-1"></div>
              <span>Class Teacher Signature</span>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-darkBrown mb-1"></div>
              <span>Principal Signature & Stamp</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportCardPage;
