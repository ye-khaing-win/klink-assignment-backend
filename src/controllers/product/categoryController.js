import Category from '../../models/product/categoryModel.js';
import * as baseController from '../base/baseController.js';

export const getAllCategories = baseController.getAll(Category);
export const getCategoryById = baseController.getOneById(Category);
export const createCategory = baseController.createOne(Category);
export const updateCategory = baseController.updateOne(Category);
export const deleteCategory = baseController.deleteOne(Category);
