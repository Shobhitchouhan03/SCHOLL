import { TransportVehicle } from '../models/TransportVehicle.js';
import { TransportStaff } from '../models/TransportStaff.js';
import { TransportRoute } from '../models/TransportRoute.js';
import { TransportStop } from '../models/TransportStop.js';
import { TransportAssignment } from '../models/TransportAssignment.js';
import { TransportTrip } from '../models/TransportTrip.js';
import { VehicleMaintenance } from '../models/VehicleMaintenance.js';
import { FuelLog } from '../models/FuelLog.js';
import { VehicleDocument } from '../models/VehicleDocument.js';
import { TransportConfiguration } from '../models/TransportConfiguration.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { FeeCalculationService } from '../services/FeeCalculationService.js';
import { GpsService } from '../services/GpsService.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// CONFIGURATION CONTROLLERS
// ==========================================

export const getTransportConfiguration = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    let config = await TransportConfiguration.findOne({ schoolId });
    if (!config) {
      config = await TransportConfiguration.create({ schoolId });
    }
    return res.status(200).json({ success: true, config });
  } catch (error) {
    console.error('Get transport config error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch transport configuration.' });
  }
};

export const updateTransportConfiguration = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const updates = req.body;

    let config = await TransportConfiguration.findOne({ schoolId });
    if (!config) {
      config = new TransportConfiguration({ schoolId, ...updates });
    } else {
      Object.assign(config, updates);
    }
    await config.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'UPDATE_TRANSPORT_CONFIG',
      entity: 'TransportConfiguration',
      description: 'Updated transport module settings.',
    });

    return res.status(200).json({ success: true, message: 'Transport configuration updated.', config });
  } catch (error) {
    console.error('Update transport config error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update transport configuration.' });
  }
};

// ==========================================
// VEHICLE CONTROLLERS
// ==========================================

export const createVehicle = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const {
      vehicleNumber,
      registrationNumber,
      vehicleType,
      make,
      model,
      manufacturingYear,
      seatingCapacity,
      currentOdometer,
      fuelType,
      chassisNumber,
      engineNumber,
      gpsDeviceId,
      notes,
    } = req.body;

    if (!vehicleNumber || !registrationNumber || !seatingCapacity) {
      return res.status(400).json({ success: false, message: 'Vehicle number, registration number, and seating capacity are required.' });
    }

    if (Number(seatingCapacity) <= 0) {
      return res.status(400).json({ success: false, message: 'Seating capacity must be positive.' });
    }

    const formattedVehicleNo = vehicleNumber.toUpperCase().trim();
    const formattedRegNo = registrationNumber.toUpperCase().trim();

    const existingNo = await TransportVehicle.findOne({ schoolId, vehicleNumber: formattedVehicleNo });
    if (existingNo) {
      return res.status(409).json({ success: false, message: 'Vehicle number already exists.' });
    }

    const existingReg = await TransportVehicle.findOne({ schoolId, registrationNumber: formattedRegNo });
    if (existingReg) {
      return res.status(409).json({ success: false, message: 'Registration number already exists.' });
    }

    const vehicle = await TransportVehicle.create({
      schoolId,
      vehicleNumber: formattedVehicleNo,
      registrationNumber: formattedRegNo,
      vehicleType: vehicleType || 'bus',
      make: make || '',
      model: model || '',
      manufacturingYear: manufacturingYear ? Number(manufacturingYear) : undefined,
      seatingCapacity: Number(seatingCapacity),
      currentOdometer: currentOdometer ? Number(currentOdometer) : 0,
      fuelType: fuelType || 'diesel',
      chassisNumber: chassisNumber || '',
      engineNumber: engineNumber || '',
      gpsDeviceId: gpsDeviceId || '',
      notes: notes || '',
      createdBy: req.user._id,
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'CREATE_VEHICLE',
      entity: 'TransportVehicle',
      description: `Created vehicle ${vehicle.vehicleNumber} (${vehicle.registrationNumber}).`,
    });

    return res.status(201).json({ success: true, message: 'Vehicle added successfully.', vehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create vehicle.' });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const vehicles = await TransportVehicle.find({ schoolId }).sort({ vehicleNumber: 1 });
    return res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vehicles.' });
  }
};

export const updateVehicleStatus = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { vehicleId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'maintenance', 'retired'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle status.' });
    }

    const vehicle = await TransportVehicle.findOne({ _id: vehicleId, schoolId });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    vehicle.status = status;
    vehicle.updatedBy = req.user._id;
    await vehicle.save();

    return res.status(200).json({ success: true, message: `Vehicle status updated to ${status}.`, vehicle });
  } catch (error) {
    console.error('Update vehicle status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update vehicle status.' });
  }
};

// ==========================================
// TRANSPORT STAFF CONTROLLERS
// ==========================================

export const createStaff = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { name, employeeCode, staffType, phone, alternatePhone, email, address, licenceNumber, licenceType, licenceExpiryDate, policeVerificationStatus, notes } = req.body;

    if (!name || !employeeCode || !phone || !staffType) {
      return res.status(400).json({ success: false, message: 'Name, employee code, phone, and staff type are required.' });
    }

    const formattedEmpCode = employeeCode.toUpperCase().trim();

    const existingCode = await TransportStaff.findOne({ schoolId, employeeCode: formattedEmpCode });
    if (existingCode) {
      return res.status(409).json({ success: false, message: 'Employee code already exists.' });
    }

    // Driver licence validation
    if (staffType === 'driver' && !licenceNumber) {
      return res.status(400).json({ success: false, message: 'Driving licence number is required for drivers.' });
    }

    const staff = await TransportStaff.create({
      schoolId,
      name: name.trim(),
      employeeCode: formattedEmpCode,
      staffType,
      phone: phone.trim(),
      alternatePhone: alternatePhone || '',
      email: (email || '').toLowerCase().trim(),
      address: address || '',
      licenceNumber: licenceNumber ? licenceNumber.toUpperCase().trim() : '',
      licenceType: licenceType || '',
      licenceExpiryDate: licenceExpiryDate ? new Date(licenceExpiryDate) : undefined,
      policeVerificationStatus: policeVerificationStatus || 'pending',
      notes: notes || '',
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Transport staff member added.', staff });
  } catch (error) {
    console.error('Create staff error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add transport staff.' });
  }
};

export const getStaff = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const staff = await TransportStaff.find({ schoolId }).sort({ name: 1 });
    return res.status(200).json({ success: true, staff });
  } catch (error) {
    console.error('Get staff error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch transport staff.' });
  }
};

// ==========================================
// ROUTE & STOP CONTROLLERS
// ==========================================

export const createRoute = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, name, code, routeType, startLocation, endLocation, estimatedDistanceKm, assignedVehicleId, assignedDriverId, maximumStudents, status } = req.body;

    if (!academicSessionId || !name || !code) {
      return res.status(400).json({ success: false, message: 'Academic session, route name, and route code are required.' });
    }

    const formattedCode = code.toUpperCase().trim();

    const existingCode = await TransportRoute.findOne({ schoolId, academicSessionId, code: formattedCode });
    if (existingCode) {
      return res.status(409).json({ success: false, message: 'Route code already exists in this academic session.' });
    }

    // Vehicle validation if assigned
    if (assignedVehicleId) {
      const vehicle = await TransportVehicle.findOne({ _id: assignedVehicleId, schoolId });
      if (!vehicle) return res.status(404).json({ success: false, message: 'Assigned vehicle not found.' });
      if (vehicle.status === 'maintenance' || vehicle.status === 'retired') {
        return res.status(400).json({ success: false, message: `Vehicle is under ${vehicle.status} and cannot be assigned.` });
      }
    }

    // Driver validation if assigned
    if (assignedDriverId) {
      const driver = await TransportStaff.findOne({ _id: assignedDriverId, schoolId, staffType: 'driver' });
      if (!driver) return res.status(404).json({ success: false, message: 'Assigned driver not found.' });
      if (driver.status === 'suspended' || driver.status === 'inactive') {
        return res.status(400).json({ success: false, message: `Driver is ${driver.status} and cannot be assigned.` });
      }
      if (driver.licenceExpiryDate && new Date(driver.licenceExpiryDate) < new Date()) {
        return res.status(400).json({ success: false, message: 'Driver licence has expired.' });
      }
    }

    const route = await TransportRoute.create({
      schoolId,
      academicSessionId,
      name: name.trim(),
      code: formattedCode,
      routeType: routeType || 'both',
      startLocation: startLocation || '',
      endLocation: endLocation || 'School Campus',
      estimatedDistanceKm: Number(estimatedDistanceKm || 0),
      assignedVehicleId: assignedVehicleId || undefined,
      assignedDriverId: assignedDriverId || undefined,
      maximumStudents: Number(maximumStudents || 40),
      status: status || 'draft',
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Transport route created.', route });
  } catch (error) {
    console.error('Create route error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create route.' });
  }
};

export const getRoutes = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const routes = await TransportRoute.find({ schoolId })
      .populate('assignedVehicleId', 'vehicleNumber registrationNumber seatingCapacity status')
      .populate('assignedDriverId', 'name phone licenceNumber licenceExpiryDate status')
      .sort({ code: 1 });

    return res.status(200).json({ success: true, routes });
  } catch (error) {
    console.error('Get routes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch routes.' });
  }
};

export const addRouteStop = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { routeId } = req.params;
    const { name, code, address, stopOrder, morningPickupTime, afternoonDropTime, monthlyFee } = req.body;

    if (!name || !code || stopOrder === undefined) {
      return res.status(400).json({ success: false, message: 'Stop name, code, and stop order are required.' });
    }

    const route = await TransportRoute.findOne({ _id: routeId, schoolId });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found.' });

    const formattedCode = code.toUpperCase().trim();

    const existingCode = await TransportStop.findOne({ schoolId, routeId, code: formattedCode });
    if (existingCode) {
      return res.status(409).json({ success: false, message: 'Stop code already exists on this route.' });
    }

    const existingOrder = await TransportStop.findOne({ schoolId, routeId, stopOrder: Number(stopOrder) });
    if (existingOrder) {
      return res.status(409).json({ success: false, message: `Stop order ${stopOrder} is already taken on this route.` });
    }

    const stop = await TransportStop.create({
      schoolId,
      routeId,
      name: name.trim(),
      code: formattedCode,
      address: address || '',
      stopOrder: Number(stopOrder),
      morningPickupTime: morningPickupTime || '07:30',
      afternoonDropTime: afternoonDropTime || '14:30',
      monthlyFeeMinor: FeeCalculationService.toMinorUnits(monthlyFee || 0),
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Stop added to route.', stop });
  } catch (error) {
    console.error('Add route stop error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add stop to route.' });
  }
};

export const getRouteStops = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { routeId } = req.params;

    const stops = await TransportStop.find({ schoolId, routeId }).sort({ stopOrder: 1 });
    return res.status(200).json({ success: true, stops });
  } catch (error) {
    console.error('Get route stops error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch route stops.' });
  }
};

// ==========================================
// STUDENT ASSIGNMENT CONTROLLERS
// ==========================================

export const createAssignment = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, studentId, routeId, pickupStopId, dropStopId, assignmentType, monthlyFee } = req.body;

    if (!academicSessionId || !studentId || !routeId) {
      return res.status(400).json({ success: false, message: 'Academic session, student, and route are required.' });
    }

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const route = await TransportRoute.findOne({ _id: routeId, schoolId });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found.' });

    // Check capacity limit
    const currentAssignmentsCount = await TransportAssignment.countDocuments({
      schoolId,
      routeId,
      status: 'active',
    });

    if (currentAssignmentsCount >= (route.maximumStudents || 40)) {
      return res.status(400).json({
        success: false,
        message: `Route capacity has been reached. Maximum students: ${route.maximumStudents}.`,
      });
    }

    // Check duplicate active assignment for student in session
    const existingAssignment = await TransportAssignment.findOne({
      schoolId,
      studentId,
      academicSessionId,
      status: 'active',
    });

    if (existingAssignment) {
      return res.status(409).json({ success: false, message: 'Student already has an active transport assignment in this session.' });
    }

    // Stop verification
    let feeMinor = FeeCalculationService.toMinorUnits(monthlyFee || 0);
    if (pickupStopId) {
      const stop = await TransportStop.findOne({ _id: pickupStopId, schoolId, routeId });
      if (!stop) return res.status(400).json({ success: false, message: 'Selected pickup stop does not belong to the selected route.' });
      if (!monthlyFee && stop.monthlyFeeMinor) feeMinor = stop.monthlyFeeMinor;
    }

    const assignment = await TransportAssignment.create({
      schoolId,
      academicSessionId,
      studentId,
      familyAccountId: student.parentProfileId || undefined,
      routeId,
      pickupStopId: pickupStopId || undefined,
      dropStopId: dropStopId || undefined,
      assignmentType: assignmentType || 'both',
      startDate: new Date(),
      monthlyFeeMinor: feeMinor,
      status: 'active',
      assignedBy: req.user._id,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Student transport assigned successfully.', assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign student transport.' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const assignments = await TransportAssignment.find({ schoolId })
      .populate({
        path: 'studentId',
        select: 'name rollNumber admissionNumber classId sectionId',
        populate: [{ path: 'classId', select: 'name' }, { path: 'sectionId', select: 'name' }],
      })
      .populate('routeId', 'name code')
      .populate('pickupStopId', 'name morningPickupTime')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch transport assignments.' });
  }
};

// ==========================================
// MAINTENANCE & FUEL CONTROLLERS
// ==========================================

export const createMaintenance = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { vehicleId, maintenanceType, title, description, serviceDate, vendorName, cost, odometerReading, nextServiceDate } = req.body;

    if (!vehicleId || !title || cost === undefined) {
      return res.status(400).json({ success: false, message: 'Vehicle, title, and cost are required.' });
    }

    const vehicle = await TransportVehicle.findOne({ _id: vehicleId, schoolId });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    const costMinor = FeeCalculationService.toMinorUnits(cost);

    const maintenance = await VehicleMaintenance.create({
      schoolId,
      vehicleId,
      maintenanceType: maintenanceType || 'service',
      title: title.trim(),
      description: description || '',
      serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
      vendorName: vendorName || '',
      costMinor,
      odometerReading: odometerReading ? Number(odometerReading) : vehicle.currentOdometer,
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
      status: 'completed',
      createdBy: req.user._id,
    });

    // Automatically set vehicle to maintenance status if scheduled or inProgress
    if (maintenanceType === 'repair') {
      vehicle.status = 'maintenance';
      await vehicle.save();
    }

    return res.status(201).json({ success: true, message: 'Maintenance record created.', maintenance });
  } catch (error) {
    console.error('Create maintenance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create maintenance record.' });
  }
};

export const getMaintenanceLogs = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const logs = await VehicleMaintenance.find({ schoolId })
      .populate('vehicleId', 'vehicleNumber registrationNumber')
      .sort({ serviceDate: -1 });

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('Get maintenance logs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch maintenance logs.' });
  }
};

export const createFuelLog = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { vehicleId, fuelDate, odometerReading, quantityLitres, amount, fuelStation } = req.body;

    if (!vehicleId || !odometerReading || !quantityLitres || !amount) {
      return res.status(400).json({ success: false, message: 'Vehicle, odometer reading, quantity, and total amount are required.' });
    }

    const vehicle = await TransportVehicle.findOne({ _id: vehicleId, schoolId });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    if (Number(odometerReading) < vehicle.currentOdometer) {
      return res.status(400).json({
        success: false,
        message: `Odometer reading (${odometerReading}) cannot be less than current odometer (${vehicle.currentOdometer}).`,
      });
    }

    const amountMinor = FeeCalculationService.toMinorUnits(amount);
    const pricePerLitreMinor = Math.round(amountMinor / Number(quantityLitres));

    const fuelLog = await FuelLog.create({
      schoolId,
      vehicleId,
      fuelDate: fuelDate ? new Date(fuelDate) : new Date(),
      odometerReading: Number(odometerReading),
      quantityLitres: Number(quantityLitres),
      amountMinor,
      pricePerLitreMinor,
      fuelStation: fuelStation || '',
      recordedBy: req.user._id,
    });

    // Update vehicle odometer
    vehicle.currentOdometer = Number(odometerReading);
    await vehicle.save();

    return res.status(201).json({ success: true, message: 'Fuel log recorded.', fuelLog });
  } catch (error) {
    console.error('Create fuel log error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record fuel log.' });
  }
};

export const getFuelLogs = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const logs = await FuelLog.find({ schoolId })
      .populate('vehicleId', 'vehicleNumber registrationNumber')
      .sort({ fuelDate: -1 });

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('Get fuel logs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch fuel logs.' });
  }
};

// ==========================================
// TEACHER & PARENT TRANSPORT CONTROLLERS
// ==========================================

export const getTeacherRouteStudents = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { routeId } = req.params;

    const route = await TransportRoute.findOne({ _id: routeId, schoolId });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found.' });

    const assignments = await TransportAssignment.find({ schoolId, routeId, status: 'active' })
      .populate({
        path: 'studentId',
        select: 'name rollNumber admissionNumber classId sectionId',
        populate: [{ path: 'classId', select: 'name' }, { path: 'sectionId', select: 'name' }],
      })
      .populate('pickupStopId', 'name morningPickupTime')
      .populate('dropStopId', 'name afternoonDropTime');

    return res.status(200).json({ success: true, route, assignments });
  } catch (error) {
    console.error('Get teacher route students error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch route student list.' });
  }
};

export const getParentChildTransport = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;

    // Parent-child linkage security check
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found.' });

    const assignment = await TransportAssignment.findOne({ schoolId, studentId, status: 'active' })
      .populate({
        path: 'routeId',
        populate: [
          { path: 'assignedVehicleId', select: 'vehicleNumber registrationNumber vehicleType status' },
          { path: 'assignedDriverId', select: 'name phone status' },
        ],
      })
      .populate('pickupStopId')
      .populate('dropStopId');

    const gpsStatus = await GpsService.getVehicleLocation(assignment?.routeId?.assignedVehicleId?._id);

    return res.status(200).json({
      success: true,
      studentName: student.name,
      hasTransport: Boolean(assignment),
      assignment,
      gpsStatus,
    });
  } catch (error) {
    console.error('Get parent child transport error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child transport details.' });
  }
};
