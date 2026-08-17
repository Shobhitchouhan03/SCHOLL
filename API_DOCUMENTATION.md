# API Documentation - Multi-Tenant School Management SaaS

This document provides complete, verified details for API endpoints in the Multi-Tenant School Management SaaS platform. All requests and responses use `application/json`. Authentication is managed via HTTP-Only JWT cookies. Every school-specific endpoint enforces strict `schoolId` multi-tenant isolation.

---

## 1. Authentication

### 1.1 Super Admin Login
- **Endpoint**: `POST /api/auth/super-admin/login`
- **Access**: Public
- **Description**: Authenticates Super Admin credentials and sets HTTP-Only JWT cookie.

#### Request Example
```json
{
  "loginId": "YOUR_SUPER_ADMIN_LOGIN_ID",
  "password": "YOUR_SUPER_ADMIN_PASSWORD"
}
```

#### Response Example (200 OK)
```json
{
  "success": true,
  "message": "Super Admin login successful.",
  "user": {
    "id": "60d5ec49f1b2c81148c12345",
    "loginId": "YOUR_SUPER_ADMIN_LOGIN_ID",
    "role": "superAdmin"
  }
}
```

### 1.2 School User Login
- **Endpoint**: `POST /api/auth/school/login`
- **Access**: Public
- **Description**: Authenticates Principal, Teacher, or Parent users for a specific school.

#### Request Example
```json
{
  "schoolCode": "YOUR_SCHOOL_CODE",
  "loginId": "YOUR_SCHOOL_USER_LOGIN_ID",
  "password": "YOUR_SCHOOL_USER_PASSWORD"
}
```

#### Response Example (200 OK)
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": "60d5ec49f1b2c81148c54321",
    "loginId": "YOUR_SCHOOL_USER_LOGIN_ID",
    "role": "principal",
    "schoolId": "60d5ec49f1b2c81148c99999"
  }
}
```

---

## 2. Super Admin School Management

### 2.1 Create School
- **Endpoint**: `POST /api/super-admin/schools`
- **Access**: Authenticated (Super Admin)
- **Description**: Registers a new school tenant and creates its principal user.

#### Request Example
```json
{
  "name": "Sample School",
  "schoolCode": "SAMPLE001",
  "email": "school@example.com",
  "phone": "+91XXXXXXXXXX",
  "address": "123 Education Lane",
  "subscriptionPlan": "Enterprise",
  "principalName": "Principal Name",
  "principalLoginId": "YOUR_PRINCIPAL_LOGIN_ID",
  "principalPassword": "YOUR_PRINCIPAL_PASSWORD",
  "confirmPassword": "YOUR_PRINCIPAL_PASSWORD"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "School created successfully.",
  "school": {
    "id": "60d5ec49f1b2c81148c99999",
    "name": "Sample School",
    "schoolCode": "SAMPLE001",
    "status": "active"
  }
}
```

### 2.2 Permanently Delete School
- **Endpoint**: `DELETE /api/super-admin/schools/:id`
- **Access**: Authenticated (Super Admin)
- **Description**: Permanently purges a school tenant and cascades deletion across all 79 tenant database collections. Requires exact schoolCode confirmation.

#### Request Example
```json
{
  "confirmSchoolCode": "SAMPLE001"
}
```

#### Response Example (200 OK)
```json
{
  "success": true,
  "message": "School 'Sample School' (SAMPLE001) and all associated tenant data were permanently deleted."
}
```

### 2.3 Bulk Permanently Delete Schools
- **Endpoint**: `POST /api/super-admin/schools/bulk-delete`
- **Access**: Authenticated (Super Admin)
- **Description**: Permanently deletes multiple schools and cascades deletion across all tenant collections.

#### Request Example
```json
{
  "schoolIds": ["60d5ec49f1b2c81148c99999", "60d5ec49f1b2c81148c99998"]
}
```

#### Response Example (200 OK)
```json
{
  "success": true,
  "message": "2 school(s) and their associated tenant data were permanently deleted.",
  "requested": 2,
  "deleted": 2,
  "failed": 0
}
```

### 2.4 Bulk Archive Schools
- **Endpoint**: `POST /api/super-admin/schools/bulk-archive`
- **Access**: Authenticated (Super Admin)
- **Description**: Suspends multiple schools and deactivates users while preserving tenant data.

#### Request Example
```json
{
  "schoolIds": ["60d5ec49f1b2c81148c99999", "60d5ec49f1b2c81148c99998"]
}
```

#### Response Example (200 OK)
```json
{
  "success": true,
  "message": "2 school(s) have been archived and suspended.",
  "archivedCount": 2
}
```

### 2.5 Bulk Dependent Counts Preview
- **Endpoint**: `POST /api/super-admin/schools/bulk-dependent-counts`
- **Access**: Authenticated (Super Admin)
- **Description**: Fetches aggregated dependent record counts across selected schools for deletion confirmation.

#### Request Example
```json
{
  "schoolIds": ["60d5ec49f1b2c81148c99999"]
}
```

#### Response Example (200 OK)
```json
{
  "success": true,
  "totalSchools": 1,
  "dependentCounts": {
    "users": 10,
    "teachers": 5,
    "students": 50,
    "families": 40,
    "documents": 15,
    "attendance": 200,
    "results": 50,
    "fees": 60,
    "hrStaff": 10
  }
}
```

### 2.6 Archive School
- **Endpoint**: `POST /api/super-admin/schools/:id/archive`
- **Access**: Authenticated (Super Admin)
- **Description**: Suspends an individual school tenant and deactivates users while retaining data.

#### Request Example
```json
{}
```

#### Response Example (200 OK)
```json
{
  "success": true,
  "message": "School 'Sample School' (SAMPLE001) has been archived and access suspended safely."
}
```

### 2.7 School Dependent Counts Preview
- **Endpoint**: `GET /api/super-admin/schools/:id/dependent-counts`
- **Access**: Authenticated (Super Admin)
- **Description**: Fetches dependent record counts for an individual school before deletion.

#### Response Example (200 OK)
```json
{
  "success": true,
  "schoolCode": "SAMPLE001",
  "schoolName": "Sample School",
  "dependentCounts": {
    "users": 10,
    "teachers": 5,
    "students": 50,
    "families": 40,
    "documents": 15,
    "attendance": 200,
    "results": 50,
    "fees": 60,
    "hrStaff": 10
  }
}
```

---

## 3. Principal Setup and Academic Structure

### 3.1 Save Academic Session
- **Endpoint**: `POST /api/principal/setup/academic-session`
- **Access**: Authenticated (Principal)
- **Description**: Creates or updates an academic session.

#### Request Example
```json
{
  "name": "2026-2027",
  "startDate": "2026-04-01",
  "endDate": "2027-03-31",
  "isCurrent": true
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Academic session created successfully.",
  "session": {
    "id": "60d5ec49f1b2c81148c00100",
    "name": "2026-2027",
    "isCurrent": true
  }
}
```

---

## 4. Teacher Management

### 4.1 Onboard Teacher
- **Endpoint**: `POST /api/principal/teachers`
- **Access**: Authenticated (Principal)
- **Description**: Onboards a new teacher account and assigns employee credentials.

#### Request Example
```json
{
  "name": "Rohan Mehta",
  "email": "rohan@school.edu",
  "phone": "+919876543210",
  "employeeId": "EMP-T-01",
  "loginId": "YOUR_TEACHER_LOGIN_ID",
  "password": "YOUR_TEACHER_PASSWORD"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Teacher onboarded successfully.",
  "teacher": {
    "id": "60d5ec49f1b2c81148c00200",
    "name": "Rohan Mehta",
    "employeeId": "EMP-T-01"
  }
}
```

---

## 5. Student Management

### 5.1 Add Student & Family Account
- **Endpoint**: `POST /api/principal/students`
- **Access**: Authenticated (Principal)
- **Description**: Admits a student and links or creates a family account.

#### Request Example
```json
{
  "firstName": "Vijay",
  "lastName": "Verma",
  "admissionNumber": "ADM-2026-001",
  "gender": "male",
  "dateOfBirth": "2012-05-15",
  "currentAcademicSessionId": "60d5ec49f1b2c81148c00100",
  "currentClassId": "60d5ec49f1b2c81148c00101",
  "currentSectionId": "60d5ec49f1b2c81148c00102",
  "familyOption": "new",
  "parentLoginId": "YOUR_PARENT_LOGIN_ID",
  "parentPassword": "YOUR_PARENT_PASSWORD"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Student admitted successfully.",
  "student": {
    "id": "60d5ec49f1b2c81148c00300",
    "name": "Vijay Verma",
    "admissionNumber": "ADM-2026-001"
  }
}
```

---

## 6. Family Account and Parent Portal

### 6.1 Get Family Directory
- **Endpoint**: `GET /api/principal/families`
- **Access**: Authenticated (Principal)
- **Description**: Lists family profiles and linked children in the school.

#### Response Example (200 OK)
```json
{
  "success": true,
  "families": [
    {
      "id": "60d5ec49f1b2c81148c00400",
      "parentLoginId": "YOUR_PARENT_LOGIN_ID",
      "linkedStudentsCount": 2
    }
  ]
}
```

---

## 7. Attendance and Homework

### 7.1 Bulk Mark Student Attendance
- **Endpoint**: `POST /api/teacher/attendance/mark`
- **Access**: Authenticated (Teacher)
- **Description**: Marks daily attendance records for a class section.

#### Request Example
```json
{
  "academicSessionId": "60d5ec49f1b2c81148c00100",
  "classId": "60d5ec49f1b2c81148c00101",
  "sectionId": "60d5ec49f1b2c81148c00102",
  "date": "2026-07-31",
  "records": [
    { "studentId": "60d5ec49f1b2c81148c00300", "status": "present" }
  ]
}
```

#### Response Example (200 OK)
```json
{
  "success": true,
  "message": "Attendance marked successfully."
}
```

---

## 8. Examination, Grading and Student Promotion

### 8.1 Create Examination
- **Endpoint**: `POST /api/principal/exams`
- **Access**: Authenticated (Principal)
- **Description**: Defines an academic examination schedule and grade parameters.

#### Request Example
```json
{
  "academicSessionId": "60d5ec49f1b2c81148c00100",
  "name": "Mid-Term Examination 2026",
  "examType": "term",
  "startDate": "2026-09-15",
  "endDate": "2026-09-25"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Examination created successfully.",
  "exam": {
    "id": "60d5ec49f1b2c81148c00450",
    "name": "Mid-Term Examination 2026",
    "status": "draft"
  }
}
```

---

## 9. Fees, Invoices and Payments

### 9.1 Create Fee Category
- **Endpoint**: `POST /api/principal/fees/categories`
- **Access**: Authenticated (Principal)
- **Description**: Defines a fee category head (e.g. Tuition Fee, Admission Fee, Exam Fee).

#### Request Example
```json
{
  "name": "Tuition Fee",
  "code": "TUITION",
  "categoryType": "tuition",
  "description": "Monthly academic tuition fee"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Fee category created successfully.",
  "category": {
    "id": "60d5ec49f1b2c81148c00111",
    "name": "Tuition Fee",
    "code": "TUITION",
    "categoryType": "tuition",
    "isActive": true
  }
}
```

### 9.2 Record Fee Payment
- **Endpoint**: `POST /api/principal/fees/payments`
- **Access**: Authenticated (Principal)
- **Description**: Records manual payment, updates invoice balance, and issues payment receipt.

#### Request Example
```json
{
  "invoiceId": "60d5ec49f1b2c81148c00333",
  "amount": 25000,
  "paymentMode": "cash",
  "referenceNumber": "REF12345"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Payment recorded successfully and receipt generated.",
  "payment": {
    "paymentNumber": "PAY-2026-0001",
    "amount": 25000,
    "paymentMode": "cash",
    "status": "recorded"
  },
  "receipt": {
    "receiptNumber": "RCT-2026-0001"
  }
}
```

---

## 10. Payroll, Leave, Recruitment and Notices

### 10.1 Create Salary Structure
- **Endpoint**: `POST /api/payroll/structures`
- **Access**: Authenticated (Principal)
- **Description**: Defines teacher/staff salary components and minor unit amounts.

#### Request Example
```json
{
  "userId": "60d5ec49f1b2c81148c00200",
  "basicSalaryMinor": 5000000,
  "houseRentAllowanceMinor": 1000000,
  "transportAllowanceMinor": 500000
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Salary structure defined successfully.",
  "salaryStructure": {
    "id": "60d5ec49f1b2c81148c00480",
    "grossSalaryMinor": 6500000
  }
}
```

---

## 11. Communication Hub

### 11.1 Create Announcement
- **Endpoint**: `POST /api/principal/communication/announcements`
- **Access**: Authenticated (Principal)
- **Description**: Broadcasts multi-channel circular announcements to selected target audiences.

#### Request Example
```json
{
  "title": "Annual Science Fair 2026",
  "content": "All students are invited to register projects.",
  "targetAudience": "all",
  "channels": ["inApp", "email", "sms"],
  "status": "published"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Announcement created (published).",
  "announcement": {
    "id": "60d5ec49f1b2c81148c00490",
    "title": "Annual Science Fair 2026",
    "status": "published"
  }
}
```

---

## 12. Transport Management

### 12.1 Create Transport Vehicle
- **Endpoint**: `POST /api/principal/transport/vehicles`
- **Access**: Authenticated (Principal)
- **Description**: Registers a fleet vehicle with seating capacity, vehicle type, and fuel type.

#### Request Example
```json
{
  "vehicleNumber": "BUS-101",
  "registrationNumber": "MH-12-AB-1001",
  "vehicleType": "bus",
  "seatingCapacity": 40,
  "currentOdometer": 15000,
  "fuelType": "diesel"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Vehicle added successfully.",
  "vehicle": {
    "_id": "60d5ec49f1b2c81148c00500",
    "vehicleNumber": "BUS-101",
    "registrationNumber": "MH-12-AB-1001",
    "status": "active"
  }
}
```

### 12.2 Create Transport Staff
- **Endpoint**: `POST /api/principal/transport/staff`
- **Access**: Authenticated (Principal)
- **Description**: Registers driver or attendant staff members with licence details.

#### Request Example
```json
{
  "name": "Ramesh Kumar",
  "employeeCode": "EMP-DRV-01",
  "staffType": "driver",
  "phone": "+919876543210",
  "licenceNumber": "DL-1420110012345"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Transport staff member added.",
  "staff": {
    "_id": "60d5ec49f1b2c81148c00505",
    "employeeCode": "EMP-DRV-01"
  }
}
```

### 12.3 Create Transport Route
- **Endpoint**: `POST /api/principal/transport/routes`
- **Access**: Authenticated (Principal)
- **Description**: Creates a transport route assigned to a vehicle and driver.

#### Request Example
```json
{
  "academicSessionId": "60d5ec49f1b2c81148c00100",
  "name": "North Zone Route 1",
  "code": "R-NORTH-01",
  "assignedVehicleId": "60d5ec49f1b2c81148c00500",
  "maximumStudents": 40
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Transport route created.",
  "route": {
    "_id": "60d5ec49f1b2c81148c00510",
    "code": "R-NORTH-01",
    "status": "draft"
  }
}
```

### 12.4 Add Route Stop
- **Endpoint**: `POST /api/principal/transport/routes/:routeId/stops`
- **Access**: Authenticated (Principal)
- **Description**: Adds a pickup/drop stop to a route with stop order and fee.

#### Request Example
```json
{
  "name": "Green Park Stop",
  "code": "ST-01",
  "stopOrder": 1,
  "morningPickupTime": "07:15",
  "afternoonDropTime": "14:45",
  "monthlyFee": 1500
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Stop added to route.",
  "stop": {
    "_id": "60d5ec49f1b2c81148c00515",
    "code": "ST-01"
  }
}
```

### 12.5 Assign Student to Transport
- **Endpoint**: `POST /api/principal/transport/assignments`
- **Access**: Authenticated (Principal)
- **Description**: Assigns a student to a route and pickup/drop stop with capacity verification.

#### Request Example
```json
{
  "academicSessionId": "60d5ec49f1b2c81148c00100",
  "studentId": "60d5ec49f1b2c81148c00300",
  "routeId": "60d5ec49f1b2c81148c00510",
  "monthlyFee": 1500
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Student transport assigned successfully.",
  "assignment": {
    "_id": "60d5ec49f1b2c81148c00520",
    "status": "active"
  }
}
```

### 12.6 Create Vehicle Maintenance Log
- **Endpoint**: `POST /api/principal/transport/maintenance`
- **Access**: Authenticated (Principal)
- **Description**: Logs vehicle maintenance/repair service and minor-unit cost.

#### Request Example
```json
{
  "vehicleId": "60d5ec49f1b2c81148c00500",
  "title": "Routine Oil & Brake Service",
  "cost": 4500,
  "odometerReading": 15200
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Maintenance record created.",
  "maintenance": {
    "_id": "60d5ec49f1b2c81148c00525",
    "status": "completed"
  }
}
```

### 12.7 Create Fuel Log
- **Endpoint**: `POST /api/principal/transport/fuel-logs`
- **Access**: Authenticated (Principal)
- **Description**: Logs fuel fill quantity, total amount, and odometer reading.

#### Request Example
```json
{
  "vehicleId": "60d5ec49f1b2c81148c00500",
  "odometerReading": 15500,
  "quantityLitres": 50,
  "amount": 4750
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Fuel log recorded.",
  "fuelLog": {
    "_id": "60d5ec49f1b2c81148c00530"
  }
}
```

### 12.8 Get Teacher Route Roster
- **Endpoint**: `GET /api/teacher/transport/routes/:routeId/students`
- **Access**: Authenticated (Teacher, Principal)
- **Description**: Fetches student roster and pickup/drop stop details for a route.

#### Response Example (200 OK)
```json
{
  "success": true,
  "route": {
    "id": "60d5ec49f1b2c81148c00510",
    "name": "North Zone Route 1"
  },
  "assignments": []
}
```

### 12.9 Get Parent Child Transport Details
- **Endpoint**: `GET /api/parent/children/:studentId/transport`
- **Access**: Authenticated (Parent, Principal)
- **Description**: Fetches assigned route, pickup/drop stop timings, driver contact, and GPS status for a linked child.

#### Response Example (200 OK)
```json
{
  "success": true,
  "studentName": "Vijay Verma",
  "hasTransport": true,
  "assignment": {
    "status": "active"
  },
  "gpsStatus": {
    "integrationConfigured": false
  }
}
```

---

## 13. Library Management

### 13.1 Create Master Book Title
- **Endpoint**: `POST /api/principal/library/books`
- **Access**: Authenticated (Principal)
- **Description**: Catalogs a new book title with authors, ISBN, category, and edition details.

#### Request Example
```json
{
  "title": "Concepts of Physics Vol 1",
  "authorNames": ["H.C. Verma"],
  "isbn13": "978-8177091877",
  "publisher": "Bharati Bhawan",
  "categoryId": "60d5ec49f1b2c81148c00600"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Book title added to catalog.",
  "book": {
    "_id": "60d5ec49f1b2c81148c00610",
    "title": "Concepts of Physics Vol 1",
    "totalCopies": 0,
    "availableCopies": 0
  }
}
```

### 13.2 Create Physical Book Copy
- **Endpoint**: `POST /api/principal/library/books/:bookId/copies`
- **Access**: Authenticated (Principal)
- **Description**: Adds a physical book copy with unique accession number, barcode, shelf location, and acquisition details.

#### Request Example
```json
{
  "accessionNumber": "ACC-001",
  "barcode": "BC-001",
  "shelfLocation": "Shelf A-1",
  "acquisitionType": "purchase",
  "purchasePrice": 450
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Physical book copy added.",
  "copy": {
    "_id": "60d5ec49f1b2c81148c00615",
    "accessionNumber": "ACC-001",
    "status": "available"
  }
}
```

### 13.3 Issue Book to Member
- **Endpoint**: `POST /api/principal/library/issues`
- **Access**: Authenticated (Principal)
- **Description**: Issues an available physical copy to an active library member, updating copy status to issued.

#### Request Example
```json
{
  "memberId": "60d5ec49f1b2c81148c00620",
  "bookCopyId": "60d5ec49f1b2c81148c00615"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Book issued successfully.",
  "issue": {
    "_id": "60d5ec49f1b2c81148c00630",
    "issueNumber": "ISS-2026-0001",
    "status": "issued"
  }
}
```

### 13.4 Get Parent Child Library Details
- **Endpoint**: `GET /api/parent/children/:studentId/library`
- **Access**: Authenticated (Parent, Principal)
- **Description**: Fetches assigned child's active book loans, due dates, fine status, and complete borrowing history.

#### Response Example (200 OK)
```json
{
  "success": true,
  "studentName": "Vijay Verma",
  "hasMembership": true,
  "activeIssues": [],
  "history": []
}
```

---

## 14. Inventory & Asset Management

### 14.1 Create Fixed Asset
- **Endpoint**: `POST /api/principal/inventory/assets`
- **Access**: Authenticated (Principal)
- **Description**: Registers a fixed asset item with barcode/asset tag indexing, location, and purchase cost.

#### Request Example
```json
{
  "assetTag": "TAG-IT-01",
  "barcode": "BC-IT-01",
  "name": "Dell Latitude Laptop",
  "categoryId": "60d5ec49f1b2c81148c00700",
  "vendorId": "60d5ec49f1b2c81148c00705",
  "location": "Staff Room 2",
  "purchaseCost": 65000
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Asset item registered.",
  "asset": {
    "_id": "60d5ec49f1b2c81148c00710",
    "assetTag": "TAG-IT-01",
    "status": "available"
  }
}
```

### 14.2 Assign Asset
- **Endpoint**: `POST /api/principal/inventory/assignments`
- **Access**: Authenticated (Principal)
- **Description**: Assigns an available asset to a teacher, student, department, or location.

#### Request Example
```json
{
  "assetId": "60d5ec49f1b2c81148c00710",
  "assigneeType": "teacher",
  "teacherId": "60d5ec49f1b2c81148c00200"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Asset assigned successfully.",
  "assignment": {
    "_id": "60d5ec49f1b2c81148c00720",
    "status": "active"
  }
}
```

### 14.3 Create Consumable Item
- **Endpoint**: `POST /api/principal/inventory/consumables`
- **Access**: Authenticated (Principal)
- **Description**: Creates a consumable stock item with unit of measure and reorder level.

#### Request Example
```json
{
  "name": "A4 Printer Paper",
  "itemCode": "CONS-A4-01",
  "unitOfMeasure": "box",
  "reorderLevel": 20,
  "initialStock": 100
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Consumable item created.",
  "item": {
    "_id": "60d5ec49f1b2c81148c00730",
    "itemCode": "CONS-A4-01",
    "currentStock": 100
  }
}
```

### 14.4 Record Stock Movement
- **Endpoint**: `POST /api/principal/inventory/stock-transactions`
- **Access**: Authenticated (Principal)
- **Description**: Logs stock in or stock out transactions and updates current stock count.

#### Request Example
```json
{
  "consumableId": "60d5ec49f1b2c81148c00730",
  "transactionType": "stock_out",
  "quantity": 85,
  "purpose": "Term Exam Printing"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Stock transaction recorded.",
  "currentStock": 15
}
```

### 14.5 Get Teacher Assigned Assets
- **Endpoint**: `GET /api/teacher/inventory/assigned-assets`
- **Access**: Authenticated (Teacher, Principal)
- **Description**: Fetches list of active assets assigned to the authenticated teacher.

#### Response Example (200 OK)
```json
{
  "success": true,
  "assignments": []
}
```

---

## 15. Health Endpoints

### 15.1 Server Health and Uptime Check
- **Endpoint**: `GET /health`
- **Access**: Public
- **Description**: Returns operational status, uptime, server time, and environment information.

#### Response Example (200 OK)
```json
{
  "status": "OK",
  "uptime": 12450.42,
  "timestamp": "2026-07-31T01:26:00.000Z",
  "environment": "development"
}
```

### 15.2 Database Health Check
- **Endpoint**: `GET /health/database`
- **Access**: Public
- **Description**: Returns database connection health and response latency.

#### Response Example (200 OK)
```json
{
  "status": "connected",
  "database": "mongodb",
  "latencyMs": 12
}
```

### 15.3 Readiness Probe
- **Endpoint**: `GET /health/readiness`
- **Access**: Public
- **Description**: Returns application readiness status for load balancer traffic routing.

#### Response Example (200 OK)
```json
{
  "ready": true
}
```

### 15.4 Liveness Probe
- **Endpoint**: `GET /health/liveness`
- **Access**: Public
- **Description**: Returns process liveness ping for container orchestrators.

#### Response Example (200 OK)
```json
---

## 16. School Settings, Branding, Gallery and Public Website (Patch Step 5A)

### 16.1 Get School Settings
- **Endpoint**: `GET /api/principal/settings`
- **Access**: Authenticated (Principal)
- **Description**: Returns full tenant configuration, contact info, schoolType, and module settings.

### 16.2 Update School Settings
- **Endpoint**: `PUT /api/principal/settings`
- **Access**: Authenticated (Principal)
- **Description**: Persists tenant settings, contact info, address, schoolType, public portal toggle, and enabled modules to MongoDB.

### 16.3 Get School Branding
- **Endpoint**: `GET /api/principal/branding`
- **Access**: Authenticated (Principal)
- **Description**: Returns school branding assets including logo, banner, letterhead, seal, tagline, and theme colors.

### 16.4 Update School Branding
- **Endpoint**: `PUT /api/principal/branding`
- **Access**: Authenticated (Principal)
- **Description**: Updates branding logos, letterheads, seals, principal signature, tagline, and primary/secondary colors.

### 16.5 Manage School Gallery
- **Endpoint**: `GET / POST / PUT / DELETE /api/principal/gallery`
- **Access**: Authenticated (Principal)
- **Description**: CRUD endpoints for tenant photos, event albums, infrastructure highlights, and achievements.

### 16.6 Public School Website Portal
- **Endpoint**: `GET /api/public/school/:schoolSlug`
- **Access**: Public
- **Description**: Returns comprehensive public portal data including branding, schoolType, enabled modules, circular notices, career job posts, and public gallery photos.

---

## 17. Custom Domain & Subdomain Management (Patch Step 5B)

### 17.1 Add Custom FQDN Domain
- **Endpoint**: `POST /api/super-admin/schools/:id/domains`
- **Access**: Private (Super Admin)
- **Description**: Maps a custom domain to a school with FQDN format validation and duplicate checking across all tenants.

### 17.2 Remove Custom Domain
- **Endpoint**: `DELETE /api/super-admin/schools/:id/domains/:domainName`
- **Access**: Private (Super Admin)
- **Description**: Removes custom domain mapping from a school.

### 17.3 Update Custom Domain Status
- **Endpoint**: `PATCH /api/super-admin/schools/:id/domains/:domainName/status`
- **Access**: Private (Super Admin)
- **Description**: Updates domain verification status (`pending`, `verified`, `disabled`).

### 17.4 Update Tenant Subdomain
- **Endpoint**: `PATCH /api/super-admin/schools/:id/subdomain`
- **Access**: Private (Super Admin)
- **Description**: Configures tenant subdomain (`little-stars`) with unique constraint checking.

### 17.5 Resolve School Portal by Host or Slug
- **Endpoint**: `GET /api/public/school/resolve`
- **Access**: Public
- **Description**: Resolves school portal using 5-priority tenant resolver based on request host header or slug.

---

## 18. Role Cleanups & Class Announcements (Patch Step 5F)

### 18.1 HR Staff & Teacher Attendance Oversight
- **Endpoint**: `GET /api/principal/hr/staff-attendance`
- **Access**: Private (Principal / HR)
- **Description**: Returns employee attendance logs, teacher presence, leaves, and department-wise staff attendance.

### 18.2 Create Teacher Class Announcement
- **Endpoint**: `POST /api/teacher/announcements`
- **Access**: Private (Teacher)
- **Description**: Allows Class Teachers to publish class announcements targeted to assigned class students and parents with priority and expiry.

### 18.3 Get Teacher Published Class Announcements
- **Endpoint**: `GET /api/teacher/announcements/my`
- **Access**: Private (Teacher)
- **Description**: Returns list of class announcements created by the authenticated Teacher.

---

## 19. Class Teacher Capabilities & Admission (Patch Step 5G)

### 19.1 Teacher Self Profile, Capabilities & Dynamic Counts
- **Endpoint**: `GET /api/teacher/me`
- **Access**: Private (Teacher)
- **Description**: Returns authenticated teacher profile along with `teacherCapabilities` payload (`canAdmitStudents`, `canMarkAttendance`, `canEnterMarks`, `canCreateClassAnnouncement`) and real-time database-calculated `assignedStudentCount`.

### 19.2 Class Teacher Student Admission
- **Endpoint**: `POST /api/teacher/students`
- **Access**: Private (Class Teacher)
- **Description**: Admits a student into assigned class/section. Validates `canAdmitStudents` capability. Subject Teachers receive `403 Forbidden`. Auto-generates/links Parent Family account and student enrollment.

---

## 20. Final Runtime Gate Audit (Patch Step 5H)

### 20.1 Unified Teacher Resolver Protection
- **Target Routes**: Teacher Profile, Leave Applications, Attendance Options, Attendance Roster, Exam Schedules, Class Announcements.
- **Access**: Private (Teacher)
- **Description**: All Teacher portal routes route through central `resolveTeacherProfile(req)` resolver service (`teacherResolver.js`). Automatically repairs unlinked `userId` fields and guarantees profile resolution with 0 runtime errors.





