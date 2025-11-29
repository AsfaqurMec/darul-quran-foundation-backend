import { Router } from 'express';
import { memberController } from './member.controller';
import { validate } from '../common/middleware/validate.middleware';
import {
  initiateMemberPaymentSchema,
  completeMemberPaymentSchema,
  submitMemberApplicationSchema,
  getMemberApplicationsQuerySchema,
  updateMemberApplicationStatusSchema,
  updateMemberApplicationPaymentStatusSchema,
} from './member.schema';
import { uploadMemberPaymentDocument } from '../uploads/upload.middleware';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { roleMiddleware } from '../common/middleware/role.middleware';
import { ROLES } from '../../constants';

const router = Router();

router.post('/online-payment', validate(initiateMemberPaymentSchema), memberController.initiatePayment);

router.post('/complete-payment', validate(completeMemberPaymentSchema), memberController.completePayment);

// payment route
router.post("/payment/success", memberController.sslSuccess);
router.post("/payment/fail", memberController.sslFail);
router.post("/payment/cancel", memberController.sslCancel);

router.post(
  '/apply',
  uploadMemberPaymentDocument.single('paymentDocument'),
  validate(submitMemberApplicationSchema),
  memberController.submitApplication
);

router.use(authMiddleware, roleMiddleware(ROLES.ADMIN));

router.get(
  '/',
  validate(getMemberApplicationsQuerySchema, 'query'),
  memberController.getMemberApplications
);

router.get('/:id', memberController.getMemberApplicationById);

router.patch(
  '/:id/status',
  validate(updateMemberApplicationStatusSchema),
  memberController.updateMemberApplicationStatus
);

router.patch(
  '/:id/payment-status',
  validate(updateMemberApplicationPaymentStatusSchema),
  memberController.updateMemberApplicationPaymentStatus
);

router.delete('/:id', memberController.deleteMemberApplication);

export default router;


