import User from '../../models/auth/userModel.js';
import * as baseController from '../base/baseController.js';

export const getAllUsers = baseController.getAll(User);
export const getUserById = baseController.getOneById(User);
export const createUser = baseController.createOne(User);
export const updateUser = baseController.updateOne(User);
export const deleteUser = baseController.deleteOne(User);
