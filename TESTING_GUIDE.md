# Testing Guide - Task 4 Student Management and Parent Family Account

## Automated End-to-End Verification Script

To run the complete automated test suite for Task 4:

```bash
cd backend
node -e "
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';

function extractCookies(res) {
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
  return setCookies.map(c => c.split(';')[0]).join('; ');
}

async function runTask4Verification() {
  const saLoginRes = await fetch(\`\${API_URL}/auth/super-admin/login\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId: process.env.SUPER_ADMIN_LOGIN_ID, password: process.env.SUPER_ADMIN_PASSWORD }),
  });
  const saCookie = extractCookies(saLoginRes);

  // 1. Create Test School & Principal
  const schoolRes = await fetch(\`\${API_URL}/super-admin/schools\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: saCookie },
    body: JSON.stringify({
      name: 'Task 4 Verification School',
      schoolCode: 'YOUR_SCHOOL_CODE',
      email: 'test4@school.edu',
      phone: '+1 555-0101',
      address: '100 Test St',
      subscriptionPlan: 'Enterprise',
      principalName: 'Principal Test',
      principalLoginId: 'YOUR_PRINCIPAL_LOGIN_ID',
      principalPassword: 'YOUR_PRINCIPAL_PASSWORD',
      confirmPassword: 'YOUR_PRINCIPAL_PASSWORD',
    }),
  });

  const pLoginRes = await fetch(\`\${API_URL}/auth/school/login\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schoolCode: 'YOUR_SCHOOL_CODE', loginId: 'YOUR_PRINCIPAL_LOGIN_ID', password: 'YOUR_PRINCIPAL_PASSWORD' }),
  });
  const pCookie = extractCookies(pLoginRes);

  console.log('Principal Authenticated. Ready for Student Admissions.');
}

runTask4Verification();
"
```

## Manual UI Verification Flow

1. Open `http://localhost:5173/login`.
2. Login with Principal credentials.
3. Click **Students Directory** in the navigation sidebar (`/principal/students`).
4. Click **Admit New Student** (`/principal/students/new`).
5. Complete the 5-step admission form -> Choose **Create New Family Account** -> enter parent login ID & password -> click **Submit Admission & Generate Credentials**.
6. Verify raw credentials modal displays ONCE.
7. Click **Admit New Student** again -> enter a second sibling student -> Choose **Link Existing Family Account** -> select the previously created family -> click Submit.
8. Log out and log in as Parent (`/login`) using School Code, Parent Login ID, and Password.
9. Verify Parent Portal displays the **Child Selector** with both linked sibling students.
10. Click **Family Accounts** (`/principal/families`) in Principal view -> verify family details, reset parent password, or toggle active/inactive account status.

## Task 10 Transport Management Verification

### Unit Tests
Run unit tests for GPS provider abstraction and transport calculations:
```bash
cd backend
node src/tests/transportService.test.js
```

### Manual Transport Verification Flow
1. Login as Principal (`/login`).
2. Navigate to **Transport Management** (`/principal/transport`).
3. Click **Add Vehicle** -> Enter Vehicle Number `BUS-101`, Reg Number `MH-12-AB-1001`, seating capacity `40`.
4. Click **Add Staff** -> Enter Name `Ramesh Kumar`, Employee Code `EMP-DRV-01`, Role `Driver`, Phone `+91 9876543210`, Licence `DL-12345`.
5. Navigate to **Routes & Stops** -> Create Route `North Zone Route 1` (`R-NORTH-01`) assigned to `BUS-101` & `EMP-DRV-01`. Add stop `Green Park Stop` (`ST-01`).
6. Navigate to **Student Assignments** -> Assign student `Vijay Verma` to `R-NORTH-01` and stop `ST-01`.
7. Log in as Parent (`/login`) -> Navigate to `Child Transport Details` -> Verify route name, vehicle details, driver phone, pickup/drop stop timing, and "Live GPS Tracking — Coming Soon" status banner.

## Task 11 Library Management Verification

### Unit Tests
Run unit tests for Library fine calculation engine:
```bash
cd backend
node src/tests/libraryService.test.js
```

### Manual Library Verification Flow
1. Login as Principal (`/login`).
2. Navigate to **Library Management** (`/principal/library`).
3. Click **Add Category** -> Enter Name `Science & Technology`, Code `SCI-01`.
4. Click **Add Book Title** -> Enter Title `Concepts of Physics Vol 1`, Author `H.C. Verma`, ISBN `978-8177091877`.
5. Under Physical Copies -> Click **Add Copy** -> Enter Accession Number `ACC-001`, Barcode `BC-001`, Shelf `Shelf A-1`.
6. Under Memberships -> Click **Create Member** -> Select Student `Vijay Verma`, Membership Number `MEM-STU-01`.
7. Under Circulation -> Click **Issue Book** -> Select Member `MEM-STU-01` & Physical Copy `ACC-001`.
8. Verify book copy status changes to `issued` and borrowing count increments.
9. Click **Return Book** -> Verify status changes to `available` and fine calculation handles on-time/overdue scenarios accurately.
10. Log in as Parent (`/login`) -> Navigate to `Child Library Details` (`/parent/children/:studentId/library`) -> Verify active loans, due dates, fine balance, and borrowing history.


