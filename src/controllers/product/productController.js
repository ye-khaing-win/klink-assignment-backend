import Product from '../../models/product/productModel.js';
import * as baseController from '../base/baseController.js';

export const getAllProducts = baseController.getAll(Product);
export const getProductById = baseController.getOneById(Product);
export const createProduct = baseController.createOne(Product);
export const updateProduct = baseController.updateOne(Product);
export const deleteProduct = baseController.deleteOne(Product);
