import express from 'express';
import * as fileController from '../../controllers/files/fileController.js';
import * as authMiddleware from '../../middlewares/authMiddleware.js';
import * as fileMiddleware from '../../middlewares/fileMiddleware.js';

const router = express.Router();

// PROTECT THE ROUTE
router.use(authMiddleware.protect);

router
  .route('/')
  .get(fileController.getAllFiles)
  .post(fileMiddleware.upload.any(), fileController.createFiles);
router
  .route('/:id')
  .get(fileController.getFileById)
  .delete(fileController.deleteFile);

export default router;
