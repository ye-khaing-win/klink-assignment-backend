import express from 'express';
import * as roleController from '../../controllers/auth/roleController.js';
import * as authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

// PROTECT THE ROUTE
// router.use(authMiddleware.protect);

router
  .route('/')
  .get(roleController.getAllRoles)
  .post(roleController.createRole);
router
  .route('/:id')
  .get(roleController.getRoleById)
  .patch(roleController.updateRole)
  .delete(roleController.deleteRole);

export default router;
