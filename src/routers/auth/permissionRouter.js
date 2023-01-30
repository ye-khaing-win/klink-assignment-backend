import express from 'express';
import * as permissionController from '../../controllers/auth/permissionController.js';
import * as authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

// PROTECT THE ROUTE
// router.use(authMiddleware.protect);

router
  .route('/')
  .get(permissionController.getAllPermissions)
  .post(permissionController.createPermission);
router
  .route('/:id')
  .get(permissionController.getPermissionById)
  .patch(permissionController.updatePermission)
  .delete(permissionController.deletePermission);

export default router;
