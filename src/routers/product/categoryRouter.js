import express from 'express';
import * as categoryController from '../../controllers/product/categoryController.js';
import * as authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

// PROTECT THE ROUTE
router.use(authMiddleware.protect);

router
  .route('/')
  .get(
    authMiddleware.authorize('category', 'list'),
    categoryController.getAllCategories
  )
  .post(
    authMiddleware.authorize('category', 'create'),
    categoryController.createCategory
  );
router
  .route('/:id')
  .get(
    authMiddleware.authorize('category', 'details'),
    categoryController.getCategoryById
  )
  .patch(
    authMiddleware.authorize('category', 'update'),
    categoryController.updateCategory
  )
  .delete(
    authMiddleware.authorize('category', 'delete'),
    categoryController.deleteCategory
  );

export default router;
