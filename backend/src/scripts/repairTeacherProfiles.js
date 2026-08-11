import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';

dotenv.config();

export async function repairTeacherProfiles() {
  console.log('==================================================');
  console.log('🔧 TEACHER PROFILE LINK REPAIR SCRIPT');
  console.log('==================================================\n');

  if (process.env.NODE_ENV === 'production') {
    console.error('❌ REPAIR ABORTED: Cannot run repair script in PRODUCTION mode.');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_saas';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  let repairedCount = 0;
  let skippedCount = 0;
  let ambiguousCount = 0;
  let missingProfileCount = 0;

  try {
    // Find all Teacher users
    const teacherUsers = await User.find({ role: 'teacher' });

    for (const user of teacherUsers) {
      const normalizedLoginId = user.loginId.trim().toLowerCase();
      const schoolId = user.schoolId;

      // Find existing teacher profiles for this school and user
      let linkedTeacher = await Teacher.findOne({ schoolId, userId: user._id });

      if (linkedTeacher) {
        skippedCount++;
        continue;
      }

      // Find unlinked profiles in the same school matching loginId or employeeId
      const candidateProfiles = await Teacher.find({
        schoolId,
        $or: [
          { loginId: { $regex: `^${normalizedLoginId}$`, $options: 'i' } },
          { employeeId: { $regex: `^${normalizedLoginId}$`, $options: 'i' } },
          { userId: { $exists: false } },
          { userId: null },
        ],
      });

      // Filter candidates to those without a conflicting userId or matching this user's attributes
      const safeMatches = candidateProfiles.filter((p) => {
        if (p.userId && p.userId.toString() !== user._id.toString()) {
          return false;
        }
        const matchLogin = p.loginId && p.loginId.trim().toLowerCase() === normalizedLoginId;
        const matchEmp = p.employeeId && p.employeeId.trim().toLowerCase() === normalizedLoginId;
        return matchLogin || matchEmp;
      });

      if (safeMatches.length === 1) {
        const targetTeacher = safeMatches[0];
        targetTeacher.userId = user._id;
        if (!targetTeacher.loginId) targetTeacher.loginId = user.loginId;
        await targetTeacher.save();
        repairedCount++;
        console.log(`✅ Linked User [${user.loginId}] -> Teacher Profile [${targetTeacher.employeeId || targetTeacher._id}]`);
      } else if (safeMatches.length > 1) {
        ambiguousCount++;
        console.warn(`⚠️ Ambiguous matches (${safeMatches.length}) found for User [${user.loginId}] in school [${schoolId}]. Skipped.`);
      } else {
        missingProfileCount++;
        console.warn(`⚠️ Missing Teacher profile for User [${user.loginId}] in school [${schoolId}].`);
      }
    }

    console.log('\n==================================================');
    console.log('📊 REPAIR SUMMARY');
    console.log('==================================================');
    console.log(`- Repaired Links: ${repairedCount}`);
    console.log(`- Already Valid:   ${skippedCount}`);
    console.log(`- Ambiguous Skipped: ${ambiguousCount}`);
    console.log(`- Missing Profiles:  ${missingProfileCount}`);
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Repair script error:', error);
  }
}

// Run directly if invoked from CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  repairTeacherProfiles()
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
