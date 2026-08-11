import { LibraryCategory } from '../models/LibraryCategory.js';
import { LibraryBook } from '../models/LibraryBook.js';
import { LibraryBookCopy } from '../models/LibraryBookCopy.js';
import { LibraryMember } from '../models/LibraryMember.js';
import { LibraryIssue } from '../models/LibraryIssue.js';
import { LibraryFine } from '../models/LibraryFine.js';
import { LibraryReservation } from '../models/LibraryReservation.js';
import { LibraryConfiguration } from '../models/LibraryConfiguration.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { AuditLog } from '../models/AuditLog.js';
import { FeeCalculationService } from '../services/FeeCalculationService.js';
import { LibraryFineCalculationService } from '../services/LibraryFineCalculationService.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// CONFIGURATION CONTROLLERS
// ==========================================

export const getLibraryConfiguration = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    let config = await LibraryConfiguration.findOne({ schoolId });
    if (!config) {
      config = await LibraryConfiguration.create({ schoolId });
    }
    return res.status(200).json({ success: true, config });
  } catch (error) {
    console.error('Get library config error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch library configuration.' });
  }
};

export const updateLibraryConfiguration = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const updates = req.body;

    let config = await LibraryConfiguration.findOne({ schoolId });
    if (!config) {
      config = new LibraryConfiguration({ schoolId, ...updates });
    } else {
      Object.assign(config, updates);
    }
    await config.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'UPDATE_LIBRARY_CONFIG',
      entity: 'LibraryConfiguration',
      description: 'Updated library configuration settings.',
    });

    return res.status(200).json({ success: true, message: 'Library configuration updated.', config });
  } catch (error) {
    console.error('Update library config error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update library configuration.' });
  }
};

// ==========================================
// CATEGORY CONTROLLERS
// ==========================================

export const createCategory = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Category name and code are required.' });
    }

    const formattedCode = code.toUpperCase().trim();

    const existingCode = await LibraryCategory.findOne({ schoolId, code: formattedCode });
    if (existingCode) {
      return res.status(409).json({ success: false, message: 'Category code already exists.' });
    }

    const category = await LibraryCategory.create({
      schoolId,
      name: name.trim(),
      code: formattedCode,
      description: description || '',
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Book category created.', category });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const categories = await LibraryCategory.find({ schoolId }).sort({ name: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// ==========================================
// BOOK CATALOG & COPIES CONTROLLERS
// ==========================================

export const createBook = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { title, subtitle, isbn10, isbn13, authorNames, publisher, publicationYear, edition, language, categoryId, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Book title is required.' });
    }

    const authors = Array.isArray(authorNames)
      ? authorNames
      : (authorNames || '').split(',').map((a) => a.trim()).filter(Boolean);

    const book = await LibraryBook.create({
      schoolId,
      title: title.trim(),
      subtitle: subtitle || '',
      isbn10: isbn10 || '',
      isbn13: isbn13 || '',
      authorNames: authors,
      publisher: publisher || '',
      publicationYear: publicationYear ? Number(publicationYear) : undefined,
      edition: edition || '',
      language: language || 'English',
      categoryId: categoryId || undefined,
      description: description || '',
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Book title added to catalog.', book });
  } catch (error) {
    console.error('Create book error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create book.' });
  }
};

export const getBooks = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { search } = req.query;

    let query = { schoolId, isActive: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authorNames: { $regex: search, $options: 'i' } },
        { isbn13: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await LibraryBook.find(query).populate('categoryId', 'name code').sort({ title: 1 });
    return res.status(200).json({ success: true, books });
  } catch (error) {
    console.error('Get books error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch books.' });
  }
};

export const createBookCopy = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { bookId } = req.params;
    const { accessionNumber, barcode, shelfLocation, acquisitionType, purchasePrice, vendor, condition } = req.body;

    if (!accessionNumber) {
      return res.status(400).json({ success: false, message: 'Accession number is required.' });
    }

    const book = await LibraryBook.findOne({ _id: bookId, schoolId });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    const formattedAccession = accessionNumber.toUpperCase().trim();
    const formattedBarcode = barcode ? barcode.toUpperCase().trim() : '';

    const existingAcc = await LibraryBookCopy.findOne({ schoolId, accessionNumber: formattedAccession });
    if (existingAcc) {
      return res.status(409).json({ success: false, message: 'Accession number already exists.' });
    }

    if (formattedBarcode) {
      const existingBC = await LibraryBookCopy.findOne({ schoolId, barcode: formattedBarcode });
      if (existingBC) {
        return res.status(409).json({ success: false, message: 'Barcode already exists.' });
      }
    }

    const copy = await LibraryBookCopy.create({
      schoolId,
      bookId,
      accessionNumber: formattedAccession,
      barcode: formattedBarcode,
      shelfLocation: shelfLocation || '',
      acquisitionType: acquisitionType || 'purchase',
      purchasePriceMinor: FeeCalculationService.toMinorUnits(purchasePrice || 0),
      vendor: vendor || '',
      condition: condition || 'good',
      status: 'available',
      createdBy: req.user._id,
    });

    // Update book copy counters
    book.totalCopies += 1;
    book.availableCopies += 1;
    await book.save();

    return res.status(201).json({ success: true, message: 'Physical book copy added.', copy });
  } catch (error) {
    console.error('Create book copy error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add book copy.' });
  }
};

export const getBookCopies = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { bookId } = req.params;

    const copies = await LibraryBookCopy.find({ schoolId, bookId }).sort({ accessionNumber: 1 });
    return res.status(200).json({ success: true, copies });
  } catch (error) {
    console.error('Get book copies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch book copies.' });
  }
};

// ==========================================
// MEMBER CONTROLLERS
// ==========================================

export const createMember = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { memberType, studentId, teacherId, membershipNumber, borrowingLimit } = req.body;

    if (!memberType || !membershipNumber) {
      return res.status(400).json({ success: false, message: 'Member type and membership number are required.' });
    }

    const formattedMemNo = membershipNumber.toUpperCase().trim();

    const existingMem = await LibraryMember.findOne({ schoolId, membershipNumber: formattedMemNo });
    if (existingMem) {
      return res.status(409).json({ success: false, message: 'Membership number already exists.' });
    }

    if (memberType === 'student') {
      if (!studentId) return res.status(400).json({ success: false, message: 'Student ID is required for student membership.' });
      const student = await Student.findOne({ _id: studentId, schoolId });
      if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

      const existingStu = await LibraryMember.findOne({ schoolId, studentId, status: 'active' });
      if (existingStu) return res.status(409).json({ success: false, message: 'Student already has an active library membership.' });
    } else if (memberType === 'teacher') {
      if (!teacherId) return res.status(400).json({ success: false, message: 'Teacher ID is required for teacher membership.' });
      const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
      if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });

      const existingTch = await LibraryMember.findOne({ schoolId, teacherId, status: 'active' });
      if (existingTch) return res.status(409).json({ success: false, message: 'Teacher already has an active library membership.' });
    }

    const member = await LibraryMember.create({
      schoolId,
      memberType,
      studentId: memberType === 'student' ? studentId : undefined,
      teacherId: memberType === 'teacher' ? teacherId : undefined,
      membershipNumber: formattedMemNo,
      borrowingLimit: borrowingLimit ? Number(borrowingLimit) : (memberType === 'teacher' ? 5 : 3),
      status: 'active',
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Library membership created.', member });
  } catch (error) {
    console.error('Create member error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create library member.' });
  }
};

export const getMembers = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const members = await LibraryMember.find({ schoolId })
      .populate('studentId', 'name rollNumber admissionNumber')
      .populate('teacherId', 'name employeeId')
      .sort({ membershipNumber: 1 });

    return res.status(200).json({ success: true, members });
  } catch (error) {
    console.error('Get members error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch library members.' });
  }
};

// ==========================================
// ISSUE & RETURN WORKFLOW CONTROLLERS
// ==========================================

export const issueBook = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { memberId, bookCopyId, dueDate } = req.body;

    if (!memberId || !bookCopyId) {
      return res.status(400).json({ success: false, message: 'Member and physical book copy are required.' });
    }

    const member = await LibraryMember.findOne({ _id: memberId, schoolId });
    if (!member) return res.status(404).json({ success: false, message: 'Library member not found.' });
    if (member.status !== 'active') return res.status(400).json({ success: false, message: `Library membership is ${member.status}. Cannot borrow.` });

    if (member.currentIssuedCount >= member.borrowingLimit) {
      return res.status(400).json({ success: false, message: `Borrowing limit (${member.borrowingLimit}) reached for this member.` });
    }

    const copy = await LibraryBookCopy.findOne({ _id: bookCopyId, schoolId }).populate('bookId');
    if (!copy) return res.status(404).json({ success: false, message: 'Book copy not found.' });
    if (copy.status !== 'available') return res.status(400).json({ success: false, message: `Book copy is ${copy.status} and not available.` });

    let config = await LibraryConfiguration.findOne({ schoolId });
    const loanDays = member.memberType === 'teacher' ? (config?.teacherLoanDays || 30) : (config?.studentLoanDays || 14);

    const calculatedDue = dueDate ? new Date(dueDate) : new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000);

    const issueNumber = `ISS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const issue = await LibraryIssue.create({
      schoolId,
      memberId: member._id,
      memberType: member.memberType,
      studentId: member.studentId,
      teacherId: member.teacherId,
      bookId: copy.bookId._id,
      bookCopyId: copy._id,
      issueNumber,
      issuedAt: new Date(),
      dueDate: calculatedDue,
      status: 'issued',
      issuedBy: req.user._id,
    });

    // Update copy and member counters atomically
    copy.status = 'issued';
    await copy.save();

    member.currentIssuedCount += 1;
    await member.save();

    const book = await LibraryBook.findById(copy.bookId._id);
    if (book) {
      book.availableCopies = Math.max(0, book.availableCopies - 1);
      book.issuedCopies += 1;
      await book.save();
    }

    return res.status(201).json({ success: true, message: 'Book issued successfully.', issue });
  } catch (error) {
    console.error('Issue book error:', error);
    return res.status(500).json({ success: false, message: 'Failed to issue book.' });
  }
};

export const renewBook = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { issueId } = req.params;

    const issue = await LibraryIssue.findOne({ _id: issueId, schoolId });
    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found.' });
    if (issue.status !== 'issued') return res.status(400).json({ success: false, message: 'Only active issued books can be renewed.' });

    let config = await LibraryConfiguration.findOne({ schoolId });
    const maxRenewals = config?.maxRenewals || 2;

    if (issue.renewalCount >= maxRenewals) {
      return res.status(400).json({ success: false, message: `Maximum renewals (${maxRenewals}) reached for this book issue.` });
    }

    const loanDays = issue.memberType === 'teacher' ? (config?.teacherLoanDays || 30) : (config?.studentLoanDays || 14);
    const newDueDate = new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000);

    issue.dueDate = newDueDate;
    issue.renewalCount += 1;
    await issue.save();

    return res.status(200).json({ success: true, message: 'Book loan renewed.', issue });
  } catch (error) {
    console.error('Renew book error:', error);
    return res.status(500).json({ success: false, message: 'Failed to renew book.' });
  }
};

export const returnBook = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { issueId } = req.params;
    const { returnCondition } = req.body;

    const issue = await LibraryIssue.findOne({ _id: issueId, schoolId }).populate('bookCopyId');
    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found.' });
    if (issue.status === 'returned') return res.status(400).json({ success: false, message: 'Book is already returned.' });

    let config = await LibraryConfiguration.findOne({ schoolId });
    const dailyRateMinor = config?.overdueFinePerDayMinor || 1000;

    const returnDate = new Date();
    const overdueFineMinor = LibraryFineCalculationService.calculateOverdueFineMinor({
      dueDate: issue.dueDate,
      returnDate,
      dailyRateMinor,
    });

    let fineRecord = null;
    if (overdueFineMinor > 0) {
      fineRecord = await LibraryFine.create({
        schoolId,
        issueId: issue._id,
        memberId: issue.memberId,
        studentId: issue.studentId,
        teacherId: issue.teacherId,
        fineType: 'overdue',
        amountMinor: overdueFineMinor,
        reason: `Overdue return by ${LibraryFineCalculationService.calculateOverdueDays(issue.dueDate, returnDate)} days.`,
        status: 'pending',
        assessedBy: req.user._id,
      });

      // Update member fine balance
      await LibraryMember.findByIdAndUpdate(issue.memberId, { $inc: { fineBalanceMinor: overdueFineMinor } });
    }

    issue.status = 'returned';
    issue.returnedAt = returnDate;
    issue.returnCondition = returnCondition || 'good';
    issue.returnedBy = req.user._id;
    issue.fineAmountMinor = overdueFineMinor;
    issue.fineStatus = overdueFineMinor > 0 ? 'pending' : 'none';
    await issue.save();

    // Update book copy & member counters
    const copy = await LibraryBookCopy.findById(issue.bookCopyId._id);
    if (copy) {
      copy.status = 'available';
      copy.condition = returnCondition || 'good';
      await copy.save();
    }

    await LibraryMember.findByIdAndUpdate(issue.memberId, { $inc: { currentIssuedCount: -1 } });

    const book = await LibraryBook.findById(issue.bookId);
    if (book) {
      book.availableCopies += 1;
      book.issuedCopies = Math.max(0, book.issuedCopies - 1);
      await book.save();
    }

    return res.status(200).json({ success: true, message: 'Book returned successfully.', issue, fineRecord });
  } catch (error) {
    console.error('Return book error:', error);
    return res.status(500).json({ success: false, message: 'Failed to return book.' });
  }
};

export const getIssues = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const issues = await LibraryIssue.find({ schoolId })
      .populate('bookId', 'title isbn13')
      .populate('bookCopyId', 'accessionNumber barcode')
      .populate({
        path: 'memberId',
        populate: [{ path: 'studentId', select: 'name rollNumber' }, { path: 'teacherId', select: 'name' }],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, issues });
  } catch (error) {
    console.error('Get issues error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch issue records.' });
  }
};

// ==========================================
// FINES CONTROLLERS
// ==========================================

export const getFines = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const fines = await LibraryFine.find({ schoolId })
      .populate({
        path: 'memberId',
        populate: [{ path: 'studentId', select: 'name' }, { path: 'teacherId', select: 'name' }],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, fines });
  } catch (error) {
    console.error('Get fines error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch library fines.' });
  }
};

export const payFine = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { fineId } = req.params;
    const { paymentReference } = req.body;

    const fine = await LibraryFine.findOne({ _id: fineId, schoolId });
    if (!fine) return res.status(404).json({ success: false, message: 'Fine record not found.' });
    if (fine.status === 'paid') return res.status(400).json({ success: false, message: 'Fine is already paid.' });

    fine.status = 'paid';
    fine.paidAt = new Date();
    fine.paymentReference = paymentReference || '';
    await fine.save();

    // Reduce member fine balance
    await LibraryMember.findByIdAndUpdate(fine.memberId, { $inc: { fineBalanceMinor: -fine.amountMinor } });

    return res.status(200).json({ success: true, message: 'Fine marked as paid.', fine });
  } catch (error) {
    console.error('Pay fine error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process fine payment.' });
  }
};

export const waiveFine = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { fineId } = req.params;
    const { waiverReason } = req.body;

    const fine = await LibraryFine.findOne({ _id: fineId, schoolId });
    if (!fine) return res.status(404).json({ success: false, message: 'Fine record not found.' });

    fine.status = 'waived';
    fine.waivedBy = req.user._id;
    fine.waiverReason = waiverReason || 'Waived by Principal';
    await fine.save();

    await LibraryMember.findByIdAndUpdate(fine.memberId, { $inc: { fineBalanceMinor: -fine.amountMinor } });

    return res.status(200).json({ success: true, message: 'Fine waived successfully.', fine });
  } catch (error) {
    console.error('Waive fine error:', error);
    return res.status(500).json({ success: false, message: 'Failed to waive fine.' });
  }
};

// ==========================================
// TEACHER & PARENT LIBRARY CONTROLLERS
// ==========================================

export const getTeacherCatalog = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const books = await LibraryBook.find({ schoolId, isActive: true })
      .populate('categoryId', 'name')
      .sort({ title: 1 });

    return res.status(200).json({ success: true, books });
  } catch (error) {
    console.error('Get teacher catalog error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch catalog.' });
  }
};

export const getParentChildLibrary = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found.' });

    const member = await LibraryMember.findOne({ schoolId, studentId, memberType: 'student' });
    if (!member) {
      return res.status(200).json({
        success: true,
        studentName: student.name,
        hasMembership: false,
        activeIssues: [],
        history: [],
      });
    }

    const issues = await LibraryIssue.find({ schoolId, memberId: member._id })
      .populate('bookId', 'title authorNames coverImageUrl')
      .populate('bookCopyId', 'accessionNumber barcode')
      .sort({ createdAt: -1 });

    const activeIssues = issues.filter((i) => i.status === 'issued' || i.status === 'overdue');

    return res.status(200).json({
      success: true,
      studentName: student.name,
      hasMembership: true,
      member,
      activeIssues,
      history: issues,
    });
  } catch (error) {
    console.error('Get parent child library error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child library details.' });
  }
};
