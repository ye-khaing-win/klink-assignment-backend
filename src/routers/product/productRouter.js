import express from 'express';
import * as productController from '../../controllers/product/productController.js';
import * as authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

// PROTECT THE ROUTE
router.use(authMiddleware.protect);

router
  .route('/')
  .get(
    authMiddleware.authorize('product', 'list'),
    productController.getAllProducts
  )
  .post(
    authMiddleware.authorize('product', 'create'),
    productController.createProduct
  );
router
  .route('/:id')
  .get(
    authMiddleware.authorize('product', 'details'),
    productController.getProductById
  )
  .patch(
    authMiddleware.authorize('product', 'update'),
    productController.updateProduct
  )
  .delete(
    authMiddleware.authorize('product', 'delete'),
    productController.deleteProduct
  );

export default router;
