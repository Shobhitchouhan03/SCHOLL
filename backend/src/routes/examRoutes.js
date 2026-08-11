import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createExam,
  getExams,
  createExamSchedule,
  getExamSchedules,
  getTeacherMarksEntryRoster,
  saveTeacherStudentMarks,
  getPrincipalMarksReview,
  approveOrReturnStudentMarks,
  generateExamResults,
  publishExamResults,
  getParentChildResults,
  executeStudentPromotions,
} from '../controllers/examController.js';

const router = express.Router();

// PRINCIPAL EXAM ROUTES
router.post('/principal/exams', authenticate, authorizeRoles('principal'), createExam);
router.get('/principal/exams', authenticate, authorizeRoles('principal', 'teacher'), getExams);
router.post('/principal/exams/:examId/schedules', authenticate, authorizeRoles('principal'), createExamSchedule);
router.get('/principal/exams/:examId/schedules', authenticate, authorizeRoles('principal', 'teacher'), getExamSchedules);
router.get('/principal/exams/:examId/marks-review', authenticate, authorizeRoles('principal'), getPrincipalMarksReview);
router.post('/principal/marks/:marksId/approve', authenticate, authorizeRoles('principal'), approveOrReturnStudentMarks);
router.post('/principal/exams/:examId/generate-results', authenticate, authorizeRoles('principal'), generateExamResults);
router.post('/principal/exams/:examId/publish-results', authenticate, authorizeRoles('principal'), publishExamResults);
router.post('/principal/promotions', authenticate, authorizeRoles('principal'), executeStudentPromotions);

// TEACHER EXAM ROUTES
router.get('/teacher/exams', authenticate, authorizeRoles('teacher'), getExams);
router.get('/teacher/exams/:examId/marks-entry', authenticate, authorizeRoles('teacher'), getTeacherMarksEntryRoster);
router.post('/teacher/exams/:examId/marks/submit', authenticate, authorizeRoles('teacher'), saveTeacherStudentMarks);

// PARENT EXAM ROUTES
router.get('/parent/children/:studentId/results', authenticate, authorizeRoles('parent'), getParentChildResults);

export default router;
