import express from 'express';
import { getPublicSchoolBySlug } from '../controllers/publicController.js';

const router = express.Router();

// Public School Branding & Host Resolver Routes
router.get('/public/school/resolve', getPublicSchoolBySlug);
router.get('/public/school/:schoolSlug', getPublicSchoolBySlug);

export default router;
