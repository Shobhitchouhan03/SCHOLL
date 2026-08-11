import { GalleryItem } from '../models/GalleryItem.js';
import { AuditLog } from '../models/AuditLog.js';

// @desc    Get Gallery Items for School
// @route   GET /api/principal/gallery
// @access  Private (Principal)
export const getGalleryItems = async (req, res) => {
  try {
    const schoolId = req.tenantSchoolId;
    const category = req.query.category;
    const visibility = req.query.visibility;

    const query = { schoolId };
    if (category) query.category = category;
    if (visibility) query.visibility = visibility;

    const items = await GalleryItem.find(query).sort({ sortOrder: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('Get gallery items error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch gallery items.' });
  }
};

// @desc    Create Gallery Item
// @route   POST /api/principal/gallery
// @access  Private (Principal)
export const createGalleryItem = async (req, res) => {
  try {
    const schoolId = req.tenantSchoolId;
    const { title, description, imageUrl, category, eventDate, visibility, sortOrder } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and image URL are required.' });
    }

    const item = await GalleryItem.create({
      schoolId,
      title: title.trim(),
      description: description ? description.trim() : '',
      imageUrl: imageUrl.trim(),
      category: category || 'general',
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      visibility: visibility || 'public',
      sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
      createdBy: req.user._id,
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'CREATE_GALLERY_ITEM',
      description: `Principal created gallery item '${item.title}'.`,
      entity: 'GalleryItem',
    });

    return res.status(201).json({
      success: true,
      message: 'Gallery item created successfully.',
      item,
    });
  } catch (error) {
    console.error('Create gallery item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create gallery item.' });
  }
};

// @desc    Update Gallery Item
// @route   PUT /api/principal/gallery/:id
// @access  Private (Principal)
export const updateGalleryItem = async (req, res) => {
  try {
    const schoolId = req.tenantSchoolId;
    const { id } = req.params;
    const { title, description, imageUrl, category, eventDate, visibility, sortOrder } = req.body;

    const item = await GalleryItem.findOne({ _id: id, schoolId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    if (title) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (imageUrl) item.imageUrl = imageUrl.trim();
    if (category) item.category = category;
    if (eventDate) item.eventDate = new Date(eventDate);
    if (visibility) item.visibility = visibility;
    if (sortOrder !== undefined) item.sortOrder = parseInt(sortOrder, 10);

    await item.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'UPDATE_GALLERY_ITEM',
      description: `Principal updated gallery item '${item.title}'.`,
      entity: 'GalleryItem',
    });

    return res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully.',
      item,
    });
  } catch (error) {
    console.error('Update gallery item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update gallery item.' });
  }
};

// @desc    Delete Gallery Item
// @route   DELETE /api/principal/gallery/:id
// @access  Private (Principal)
export const deleteGalleryItem = async (req, res) => {
  try {
    const schoolId = req.tenantSchoolId;
    const { id } = req.params;

    const item = await GalleryItem.findOneAndDelete({ _id: id, schoolId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'DELETE_GALLERY_ITEM',
      description: `Principal deleted gallery item '${item.title}'.`,
      entity: 'GalleryItem',
    });

    return res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully.',
    });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete gallery item.' });
  }
};
