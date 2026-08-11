import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { StudentAttendance } from '../models/StudentAttendance.js';
import { Homework } from '../models/Homework.js';
import { Exam } from '../models/Exam.js';
import { Result } from '../models/Result.js';
import { FeeInvoice } from '../models/FeeInvoice.js';
import { FeePayment } from '../models/FeePayment.js';
import { FeeReceipt } from '../models/FeeReceipt.js';
import { StudentLeave } from '../models/StudentLeave.js';

dotenv.config();

export const cleanDemoData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_saas';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('🧹 Cleaning temporary test schools and orphaned records...');

    // Find test schools created during verification runs (code starting with SCH_S)
    const testSchools = await School.find({ schoolCode: { $regex: '^SCH_S' } });
    const schoolIds = testSchools.map((s) => s._id);

    if (schoolIds.length > 0) {
      await Promise.all([
        User.deleteMany({ schoolId: { $in: schoolIds } }),
        Student.deleteMany({ schoolId: { $in: schoolIds } }),
        Teacher.deleteMany({ schoolId: { $in: schoolIds } }),
        ParentProfile.deleteMany({ schoolId: { $in: schoolIds } }),
        StudentAttendance.deleteMany({ schoolId: { $in: schoolIds } }),
        Homework.deleteMany({ schoolId: { $in: schoolIds } }),
        Exam.deleteMany({ schoolId: { $in: schoolIds } }),
        Result.deleteMany({ schoolId: { $in: schoolIds } }),
        FeeInvoice.deleteMany({ schoolId: { $in: schoolIds } }),
        FeePayment.deleteMany({ schoolId: { $in: schoolIds } }),
        FeeReceipt.deleteMany({ schoolId: { $in: schoolIds } }),
        StudentLeave.deleteMany({ schoolId: { $in: schoolIds } }),
        School.deleteMany({ _id: { $in: schoolIds } }),
      ]);
      console.log(`✅ Purged ${schoolIds.length} temporary test schools and dependent records.`);
    } else {
      console.log('ℹ️ No temporary test schools found to clean.');
    }
  } catch (error) {
    console.error('Demo cleanup error:', error);
  }
};

if (process.argv[1] && process.argv[1].endsWith('cleanDemoData.js')) {
  cleanDemoData().then(() => process.exit(0));
}
