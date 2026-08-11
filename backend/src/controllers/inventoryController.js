import { AssetCategory } from '../models/AssetCategory.js';
import { Vendor } from '../models/Vendor.js';
import { Asset } from '../models/Asset.js';
import { AssetAssignment } from '../models/AssetAssignment.js';
import { AssetMaintenance } from '../models/AssetMaintenance.js';
import { AssetDisposal } from '../models/AssetDisposal.js';
import { ConsumableItem } from '../models/ConsumableItem.js';
import { StockTransaction } from '../models/StockTransaction.js';
import { Teacher } from '../models/Teacher.js';
import { AuditLog } from '../models/AuditLog.js';
import { FeeCalculationService } from '../services/FeeCalculationService.js';
import { InventoryService } from '../services/InventoryService.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// CATEGORY & VENDOR CONTROLLERS
// ==========================================

export const createAssetCategory = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { name, code, description, depreciationRate } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Category name and code are required.' });
    }

    const formattedCode = code.toUpperCase().trim();
    const existing = await AssetCategory.findOne({ schoolId, code: formattedCode });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Asset category code already exists.' });
    }

    const category = await AssetCategory.create({
      schoolId,
      name: name.trim(),
      code: formattedCode,
      description: description || '',
      depreciationRate: depreciationRate ? Number(depreciationRate) : 0,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Asset category created.', category });
  } catch (error) {
    console.error('Create asset category error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create asset category.' });
  }
};

export const getAssetCategories = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const categories = await AssetCategory.find({ schoolId, isActive: true }).sort({ name: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Get asset categories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch asset categories.' });
  }
};

export const createVendor = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { name, vendorCode, contactPerson, email, phone, address, gstNumber } = req.body;

    if (!name || !vendorCode) {
      return res.status(400).json({ success: false, message: 'Vendor name and vendor code are required.' });
    }

    const formattedCode = vendorCode.toUpperCase().trim();
    const existing = await Vendor.findOne({ schoolId, vendorCode: formattedCode });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Vendor code already exists.' });
    }

    const vendor = await Vendor.create({
      schoolId,
      name: name.trim(),
      vendorCode: formattedCode,
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      gstNumber: gstNumber || '',
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Vendor profile created.', vendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create vendor.' });
  }
};

export const getVendors = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const vendors = await Vendor.find({ schoolId, isActive: true }).sort({ name: 1 });
    return res.status(200).json({ success: true, vendors });
  } catch (error) {
    console.error('Get vendors error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendors.' });
  }
};

// ==========================================
// FIXED ASSETS CONTROLLERS
// ==========================================

export const createAsset = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { assetTag, barcode, name, categoryId, vendorId, serialNumber, location, purchaseCost, warrantyExpiry, condition } = req.body;

    if (!assetTag || !name || !categoryId) {
      return res.status(400).json({ success: false, message: 'Asset tag, name, and category are required.' });
    }

    const formattedTag = assetTag.toUpperCase().trim();
    const formattedBarcode = barcode ? barcode.toUpperCase().trim() : '';

    const existingTag = await Asset.findOne({ schoolId, assetTag: formattedTag });
    if (existingTag) {
      return res.status(409).json({ success: false, message: 'Asset tag already exists.' });
    }

    if (formattedBarcode) {
      const existingBC = await Asset.findOne({ schoolId, barcode: formattedBarcode });
      if (existingBC) {
        return res.status(409).json({ success: false, message: 'Barcode already exists.' });
      }
    }

    const category = await AssetCategory.findById(categoryId);

    const asset = await Asset.create({
      schoolId,
      assetTag: formattedTag,
      barcode: formattedBarcode,
      name: name.trim(),
      categoryId,
      vendorId: vendorId || undefined,
      serialNumber: serialNumber || '',
      location: location || '',
      purchaseCostMinor: FeeCalculationService.toMinorUnits(purchaseCost || 0),
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
      depreciationRate: category?.depreciationRate || 0,
      condition: condition || 'good',
      status: 'available',
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Asset item registered.', asset });
  } catch (error) {
    console.error('Create asset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create asset.' });
  }
};

export const getAssets = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { search, status } = req.query;

    let query = { schoolId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const assets = await Asset.find(query)
      .populate('categoryId', 'name code')
      .populate('vendorId', 'name vendorCode')
      .sort({ createdAt: -1 });

    const assetsWithDepreciation = assets.map((a) => {
      const item = a.toObject();
      item.currentValueMinor = InventoryService.calculateCurrentDepreciatedValueMinor({
        purchaseCostMinor: a.purchaseCostMinor,
        purchaseDate: a.purchaseDate,
        depreciationRate: a.depreciationRate,
      });
      return item;
    });

    return res.status(200).json({ success: true, assets: assetsWithDepreciation });
  } catch (error) {
    console.error('Get assets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assets.' });
  }
};

// ==========================================
// ASSET ASSIGNMENT & MAINTENANCE CONTROLLERS
// ==========================================

export const assignAsset = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { assetId, assigneeType, teacherId, studentId, expectedReturnDate } = req.body;

    if (!assetId || !assigneeType) {
      return res.status(400).json({ success: false, message: 'Asset and assignee type are required.' });
    }

    const asset = await Asset.findOne({ _id: assetId, schoolId });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });
    if (asset.status !== 'available') return res.status(400).json({ success: false, message: `Asset is currently ${asset.status} and cannot be assigned.` });

    const assignment = await AssetAssignment.create({
      schoolId,
      assetId,
      assigneeType,
      teacherId: assigneeType === 'teacher' ? teacherId : undefined,
      studentId: assigneeType === 'student' ? studentId : undefined,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
      status: 'active',
      assignedBy: req.user._id,
    });

    asset.status = 'assigned';
    await asset.save();

    return res.status(201).json({ success: true, message: 'Asset assigned successfully.', assignment });
  } catch (error) {
    console.error('Assign asset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign asset.' });
  }
};

export const returnAsset = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { assignmentId } = req.params;

    const assignment = await AssetAssignment.findOne({ _id: assignmentId, schoolId });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment record not found.' });

    assignment.status = 'returned';
    assignment.actualReturnDate = new Date();
    assignment.returnedBy = req.user._id;
    await assignment.save();

    await Asset.findByIdAndUpdate(assignment.assetId, { status: 'available' });

    return res.status(200).json({ success: true, message: 'Asset returned successfully.', assignment });
  } catch (error) {
    console.error('Return asset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to return asset.' });
  }
};

export const createMaintenance = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { assetId, vendorId, maintenanceType, cost, notes } = req.body;

    const asset = await Asset.findOne({ _id: assetId, schoolId });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });

    const maintenance = await AssetMaintenance.create({
      schoolId,
      assetId,
      vendorId: vendorId || undefined,
      maintenanceType: maintenanceType || 'preventive',
      costMinor: FeeCalculationService.toMinorUnits(cost || 0),
      notes: notes || '',
      status: 'in_progress',
      createdBy: req.user._id,
    });

    asset.status = 'maintenance';
    await asset.save();

    return res.status(201).json({ success: true, message: 'Maintenance record created.', maintenance });
  } catch (error) {
    console.error('Create maintenance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to log maintenance.' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const assignments = await AssetAssignment.find({ schoolId })
      .populate('assetId', 'name assetTag location')
      .populate('teacherId', 'name employeeId')
      .populate('studentId', 'name rollNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch asset assignments.' });
  }
};

// ==========================================
// CONSUMABLE INVENTORY CONTROLLERS
// ==========================================

export const createConsumableItem = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { name, itemCode, categoryId, unitOfMeasure, reorderLevel, initialStock, unitPrice } = req.body;

    if (!name || !itemCode) {
      return res.status(400).json({ success: false, message: 'Item name and code are required.' });
    }

    const formattedCode = itemCode.toUpperCase().trim();
    const existing = await ConsumableItem.findOne({ schoolId, itemCode: formattedCode });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Consumable item code already exists.' });
    }

    const item = await ConsumableItem.create({
      schoolId,
      name: name.trim(),
      itemCode: formattedCode,
      categoryId: categoryId || undefined,
      unitOfMeasure: unitOfMeasure || 'pcs',
      reorderLevel: reorderLevel ? Number(reorderLevel) : 10,
      currentStock: initialStock ? Number(initialStock) : 0,
      averageUnitPriceMinor: FeeCalculationService.toMinorUnits(unitPrice || 0),
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Consumable item created.', item });
  } catch (error) {
    console.error('Create consumable error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create consumable item.' });
  }
};

export const getConsumables = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const items = await ConsumableItem.find({ schoolId, isActive: true }).sort({ name: 1 });

    const itemsWithAlerts = items.map((i) => {
      const obj = i.toObject();
      obj.isLowStock = InventoryService.isLowStock({ currentStock: i.currentStock, reorderLevel: i.reorderLevel });
      return obj;
    });

    return res.status(200).json({ success: true, items: itemsWithAlerts });
  } catch (error) {
    console.error('Get consumables error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch consumable stock.' });
  }
};

export const recordStockTransaction = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { consumableId, transactionType, quantity, unitPrice, purpose } = req.body;

    const item = await ConsumableItem.findOne({ _id: consumableId, schoolId });
    if (!item) return res.status(404).json({ success: false, message: 'Consumable item not found.' });

    const qty = Number(quantity);
    if (!qty || qty <= 0) return res.status(400).json({ success: false, message: 'Quantity must be positive.' });

    if (transactionType === 'stock_out' && item.currentStock < qty) {
      return res.status(400).json({ success: false, message: `Insufficient stock (${item.currentStock} ${item.unitOfMeasure} available).` });
    }

    const priceMinor = FeeCalculationService.toMinorUnits(unitPrice || 0);

    const transaction = await StockTransaction.create({
      schoolId,
      consumableId,
      transactionType,
      quantity: qty,
      unitPriceMinor: priceMinor,
      totalAmountMinor: priceMinor * qty,
      purpose: purpose || '',
      performedBy: req.user._id,
    });

    if (transactionType === 'stock_in') {
      item.currentStock += qty;
    } else if (transactionType === 'stock_out') {
      item.currentStock = Math.max(0, item.currentStock - qty);
    }
    await item.save();

    return res.status(201).json({ success: true, message: 'Stock transaction recorded.', transaction, currentStock: item.currentStock });
  } catch (error) {
    console.error('Stock transaction error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record stock movement.' });
  }
};

// ==========================================
// TEACHER INVENTORY PORTAL CONTROLLERS
// ==========================================

export const getTeacherAssignedAssets = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const teacher = await Teacher.findOne({ schoolId, userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });

    const assignments = await AssetAssignment.find({ schoolId, teacherId: teacher._id, status: 'active' })
      .populate({
        path: 'assetId',
        populate: [{ path: 'categoryId', select: 'name' }],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error('Get teacher assets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned assets.' });
  }
};

export const fileDamageReport = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { assetId, notes } = req.body;

    const asset = await Asset.findOne({ _id: assetId, schoolId });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });

    asset.status = 'damaged';
    asset.condition = 'damaged';
    asset.notes = notes || 'Damage reported by teacher.';
    await asset.save();

    return res.status(200).json({ success: true, message: 'Damage report filed successfully.', asset });
  } catch (error) {
    console.error('File damage report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to file damage report.' });
  }
};
