import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../../');
const frontendDir = path.resolve(rootDir, 'frontend');
const backendDir = path.resolve(rootDir, 'backend');

const nodeBin = process.execPath;
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('==================================================');
console.log('🚀 RUNNING MASTER SYSTEM VERIFICATION (npm run verify)');
console.log('==================================================\n');

try {
  // 1. Frontend Production Build Verification
  console.log('--- Step 1: Frontend Production Build ---');
  execFileSync(npmCmd, ['run', 'build'], {
    cwd: frontendDir,
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✅ Step 1 Passed: Frontend production build succeeded.\n');

  // 2. Unit & Integration Tests
  console.log('--- Step 2: Running Unit & Isolation Tests ---');
  const unitTests = [
    'src/tests/transportService.test.js',
    'src/tests/libraryService.test.js',
    'src/tests/inventoryService.test.js',
    'src/tests/tenantIsolation.test.js',
    'src/tests/financialIntegrity.test.js',
    'src/tests/tenantResolver.test.js',
    'src/tests/principalProtection.test.js',
    'src/tests/step5f.test.js',
    'src/tests/step5g.test.js',
    'src/tests/step5h.test.js',
    'src/tests/authIntegration.test.js',
    'src/tests/classTeacherAssignment.test.js',
    'src/tests/teacherProfileAdmission.test.js',
    'src/tests/teacherRouteContract.test.js',
    'src/tests/teacherProfileCanonical.test.js',
    'src/tests/stepT2RoleArchitecture.test.js',
    'src/tests/stepT3ClassTeacherWorkspace.test.js',
    'src/tests/stepT4SubjectTeacherCrossClass.test.js',
    'src/tests/stepT5StudentParentLifecycle.test.js',
    'src/tests/stepT6Finalization.test.js',
    'src/tests/stepT7PreDeploymentQA.test.js',
    'src/tests/stepT9ProductionHotfix.test.js',
    'src/tests/stepT10FinalQA.test.js',
    'src/tests/stepT11ProductionHotfix.test.js',
    'src/tests/stepT12DataFlowHotfix.test.js',
    'src/tests/stepT13RoleSessionHotfix.test.js',
  ];

  for (const testFile of unitTests) {
    const testPath = path.resolve(backendDir, testFile);
    execFileSync(nodeBin, [testPath], {
      cwd: backendDir,
      stdio: 'inherit',
      env: process.env,
    });
  }
  console.log('✅ Step 2 Passed: All unit & integration tests succeeded.\n');

  // 3. API Documentation Audit
  console.log('--- Step 3: API Documentation Audit ---');
  const apiDocsPath = path.resolve(rootDir, 'API_DOCUMENTATION.md');
  const apiDocs = fs.readFileSync(apiDocsPath, 'utf8');

  const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
  let jsonMatch;
  let jsonFailures = 0;
  while ((jsonMatch = jsonRegex.exec(apiDocs)) !== null) {
    try {
      JSON.parse(jsonMatch[1]);
    } catch (e) {
      jsonFailures++;
    }
  }
  if (jsonFailures > 0) throw new Error(`API Documentation has ${jsonFailures} invalid JSON blocks.`);

  const epRegex = /- \*\*Endpoint\*\*: `([A-Z]+ \/[^`]+)`/g;
  let epMatch;
  const endpoints = [];
  while ((epMatch = epRegex.exec(apiDocs)) !== null) {
    endpoints.push(epMatch[1]);
  }
  const epCounts = {};
  endpoints.forEach((ep) => { epCounts[ep] = (epCounts[ep] || 0) + 1; });
  const dupEndpoints = Object.keys(epCounts).filter((ep) => epCounts[ep] > 1);

  if (dupEndpoints.length > 0) throw new Error(`API Documentation has duplicate endpoints: ${dupEndpoints.join(', ')}`);
  console.log(`✅ Step 3 Passed: Documented ${endpoints.length} unique endpoints with 0 JSON errors.\n`);

  // 4. TS/TSX Absence Audit
  console.log('--- Step 4: TypeScript Absence Audit ---');
  function findTsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
          results = results.concat(findTsFiles(file));
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    });
    return results;
  }
  const tsFiles = findTsFiles(rootDir);
  if (tsFiles.length > 0) throw new Error(`Found TS/TSX files: ${tsFiles.join(', ')}`);
  console.log('✅ Step 4 Passed: Project is 100% JavaScript and JSX (0 TS/TSX files).\n');

  // 5. Git-Ignore Audit
  console.log('--- Step 5: Git-Ignore Audit ---');
  const gitignore = fs.readFileSync(path.resolve(rootDir, '.gitignore'), 'utf8');
  if (!gitignore.includes('DEV_CREDENTIALS.local.md') || !gitignore.includes('.env')) {
    throw new Error('.gitignore must ignore DEV_CREDENTIALS.local.md and .env');
  }
  console.log('✅ Step 5 Passed: Security credentials and environment files are Git-ignored.\n');

  console.log('==================================================');
  console.log('🎉 ALL MASTER VERIFICATION CHECKS PASSED (100% READY)');
  console.log('==================================================');
} catch (error) {
  console.error('\n❌ MASTER VERIFICATION FAILED:', error.message);
  process.exit(1);
}
