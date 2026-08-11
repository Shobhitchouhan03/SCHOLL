import { StudentMarks } from '../models/StudentMarks.js';
import { GradingScheme } from '../models/GradingScheme.js';
import { ExamSchedule } from '../models/ExamSchedule.js';
import { Subject } from '../models/Subject.js';

export class ResultCalculationService {
  /**
   * Helper to look up grade given a percentage and grading scheme ranges
   */
  static getGradeFromPercentage(pct, schemeRanges) {
    if (!schemeRanges || schemeRanges.length === 0) {
      if (pct >= 90) return 'A1';
      if (pct >= 80) return 'A2';
      if (pct >= 70) return 'B1';
      if (pct >= 60) return 'B2';
      if (pct >= 50) return 'C1';
      if (pct >= 40) return 'C2';
      if (pct >= 33) return 'D';
      return 'E';
    }

    const range = schemeRanges.find(
      (r) => pct >= r.minimumPercentage && pct <= r.maximumPercentage
    );
    return range ? range.grade : 'D';
  }

  /**
   * Calculate results for a list of approved student marks
   */
  static async calculateStudentResult({ schoolId, examId, student, approvedMarksList, academicSessionId }) {
    const gradingScheme = await GradingScheme.findOne({ schoolId, isDefault: true }) || {
      ranges: [],
      passingPercentage: 33,
    };

    let totalObtainedMarks = 0;
    let totalMaximumMarks = 0;
    let failedSubjectsCount = 0;
    let absentSubjectsCount = 0;

    const subjectResults = [];

    for (const markRecord of approvedMarksList) {
      const subject = await Subject.findById(markRecord.subjectId);
      const subjectName = subject ? subject.name : 'Subject';

      const obtained = markRecord.attendanceStatus === 'absent' ? 0 : markRecord.totalMarks;
      const max = markRecord.maximumMarks || 100;
      const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
      const grade = this.getGradeFromPercentage(pct, gradingScheme.ranges);

      let passStatus = 'pass';
      if (markRecord.attendanceStatus === 'absent') {
        passStatus = 'absent';
        absentSubjectsCount++;
      } else if (pct < (gradingScheme.passingPercentage || 33)) {
        passStatus = 'fail';
        failedSubjectsCount++;
      }

      totalObtainedMarks += obtained;
      totalMaximumMarks += max;

      subjectResults.push({
        subjectId: markRecord.subjectId,
        subjectName,
        obtainedMarks: obtained,
        maximumMarks: max,
        percentage: pct,
        grade,
        passStatus,
        remark: markRecord.remark || '',
      });
    }

    const percentage = totalMaximumMarks > 0 ? Math.round((totalObtainedMarks / totalMaximumMarks) * 100) : 0;
    const overallGrade = this.getGradeFromPercentage(percentage, gradingScheme.ranges);

    let resultStatus = 'pass';
    if (absentSubjectsCount === approvedMarksList.length && approvedMarksList.length > 0) {
      resultStatus = 'absent';
    } else if (failedSubjectsCount > 1) {
      resultStatus = 'fail';
    } else if (failedSubjectsCount === 1) {
      resultStatus = 'compartment';
    } else if (percentage < (gradingScheme.passingPercentage || 33)) {
      resultStatus = 'fail';
    }

    return {
      schoolId,
      examId,
      academicSessionId,
      studentId: student._id,
      classId: student.currentClassId,
      sectionId: student.currentSectionId,
      subjectResults,
      totalObtainedMarks,
      totalMaximumMarks,
      percentage,
      overallGrade,
      resultStatus,
      isPublished: false,
    };
  }
}
