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
router.get('/principal/library/configuration', authenticate, authorizeRoles('principal', 'hr'), getLibraryConfiguration);
router.patch('/principal/library/configuration', authenticate, authorizeRoles('principal', 'hr'), updateLibraryConfiguration);

router.get('/principal/library/categories', authenticate, authorizeRoles('principal', 'hr'), getCategories);
router.post('/principal/library/categories', authenticate, authorizeRoles('principal', 'hr'), createCategory);

router.get('/principal/library/books', authenticate, authorizeRoles('principal', 'teacher'), getBooks);
router.post('/principal/library/books', authenticate, authorizeRoles('principal', 'hr'), createBook);

router.get('/principal/library/books/:bookId/copies', authenticate, authorizeRoles('principal', 'teacher'), getBookCopies);
router.post('/principal/library/books/:bookId/copies', authenticate, authorizeRoles('principal', 'hr'), createBookCopy);

router.get('/principal/library/members', authenticate, authorizeRoles('principal', 'hr'), getMembers);
router.post('/principal/library/members', authenticate, authorizeRoles('principal', 'hr'), createMember);

router.get('/principal/library/issues', authenticate, authorizeRoles('principal', 'hr'), getIssues);
router.post('/principal/library/issues', authenticate, authorizeRoles('principal', 'hr'), issueBook);
router.post('/principal/library/issues/:issueId/renew', authenticate, authorizeRoles('principal', 'hr'), renewBook);
router.post('/principal/library/issues/:issueId/return', authenticate, authorizeRoles('principal', 'hr'), returnBook);

router.get('/principal/library/fines', authenticate, authorizeRoles('principal', 'hr'), getFines);
router.post('/principal/library/fines/:fineId/pay', authenticate, authorizeRoles('principal', 'hr'), payFine);
router.post('/principal/library/fines/:fineId/waive', authenticate, authorizeRoles('principal', 'hr'), waiveFine);

// TEACHER LIBRARY ROUTES
router.get('/teacher/library/catalog', authenticate, authorizeRoles('teacher', 'principal'), getTeacherCatalog);

// PARENT LIBRARY ROUTES
router.get('/parent/children/:studentId/library', authenticate, authorizeRoles('parent', 'principal'), getParentChildLibrary);

export default router;
