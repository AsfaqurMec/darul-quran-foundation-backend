import { Router } from 'express';
import { donationController } from './donation.controller';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { validate } from '../common/middleware/validate.middleware';
import { createDonationSchema } from './donation.schema';

const router = Router();

// Create donation (public endpoint, no authentication required)
router.post('/', validate(createDonationSchema), donationController.createDonation);

// NEW SSLCOMMERZ CALLBACK ROUTES
// CORS is handled globally in app.ts with special handling for payment callbacks
router.post("/payment/success", donationController.sslSuccess);
router.post("/payment/fail", donationController.sslFail);
router.post("/payment/cancel", donationController.sslCancel);
// All admin routes require authentication
router.use(authMiddleware);

// My donations (authenticated user)
router.get('/my', donationController.getMyDonations);

// Get all donations (admin only)
router.get('/', donationController.getAllDonations);

// Get single donation (admin only)
router.get('/:id', donationController.getDonationById);

export default router;

