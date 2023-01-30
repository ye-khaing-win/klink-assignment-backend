import express from 'express';
import * as userController from '../../controllers/auth/userController.js';
import * as authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

// PROTECT THE ROUTE
// router.use(authMiddleware.protect);

router
  .route('/')
  .get(authMiddleware.authorize('user', 'list'), userController.getAllUsers)
  .post(authMiddleware.authorize('user', 'create'), userController.createUser);

router
  .route('/:id')
  .get(authMiddleware.authorize('user', 'details'), userController.getUserById)
  .patch(authMiddleware.authorize('user', 'update'), userController.updateUser)
  .delete(
    authMiddleware.authorize('user', 'delete'),
    userController.deleteUser
  );

export default router;
