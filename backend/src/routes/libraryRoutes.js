import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  getLibraryConfiguration,
  updateLibraryConfiguration,
  createCategory,
  getCategories,
  createBook,
  getBooks,
  createBookCopy,
  getBookCopies,
  createMember,
  getMembers,
  issueBook,
  renewBook,
  returnBook,
  getIssues,
  getFines,
  payFine,
  waiveFine,
  getTeacherCatalog,
  getParentChildLibrary,
} from '../controllers/libraryController.js';

const router = express.Router();

// PRINCIPAL LIBRARY ROUTES
router.get('/principal/library/configuration', authenticate, authorizeRoles('principal'), getLibraryConfiguration);
router.patch('/principal/library/configuration', authenticate, authorizeRoles('principal'), updateLibraryConfiguration);

router.get('/principal/library/categories', authenticate, authorizeRoles('principal'), getCategories);
router.post('/principal/library/categories', authenticate, authorizeRoles('principal'), createCategory);

router.get('/principal/library/books', authenticate, authorizeRoles('principal', 'teacher'), getBooks);
router.post('/principal/library/books', authenticate, authorizeRoles('principal'), createBook);

router.get('/principal/library/books/:bookId/copies', authenticate, authorizeRoles('principal', 'teacher'), getBookCopies);
router.post('/principal/library/books/:bookId/copies', authenticate, authorizeRoles('principal'), createBookCopy);

router.get('/principal/library/members', authenticate, authorizeRoles('principal'), getMembers);
router.post('/principal/library/members', authenticate, authorizeRoles('principal'), createMember);

router.get('/principal/library/issues', authenticate, authorizeRoles('principal'), getIssues);
router.post('/principal/library/issues', authenticate, authorizeRoles('principal'), issueBook);
router.post('/principal/library/issues/:issueId/renew', authenticate, authorizeRoles('principal'), renewBook);
router.post('/principal/library/issues/:issueId/return', authenticate, authorizeRoles('principal'), returnBook);

router.get('/principal/library/fines', authenticate, authorizeRoles('principal'), getFines);
router.post('/principal/library/fines/:fineId/pay', authenticate, authorizeRoles('principal'), payFine);
router.post('/principal/library/fines/:fineId/waive', authenticate, authorizeRoles('principal'), waiveFine);

// TEACHER LIBRARY ROUTES
router.get('/teacher/library/catalog', authenticate, authorizeRoles('teacher', 'principal'), getTeacherCatalog);

// PARENT LIBRARY ROUTES
router.get('/parent/children/:studentId/library', authenticate, authorizeRoles('parent', 'principal'), getParentChildLibrary);

export default router;
