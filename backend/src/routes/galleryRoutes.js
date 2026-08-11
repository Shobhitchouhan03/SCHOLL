import express from 'express';
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantGuard } from '../middleware/tenantGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(protect);
router.use(roleGuard('principal'));
router.use(tenantGuard);

router.route('/principal/gallery')
  .get(getGalleryItems)
  .post(createGalleryItem);

router.route('/principal/gallery/:id')
  .put(updateGalleryItem)
  .delete(deleteGalleryItem);

export default router;
