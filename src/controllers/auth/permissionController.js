import Permission from '../../models/auth/permissionModel.js';
import * as baseController from '../base/baseController.js';

export const getAllPermissions = baseController.getAll(Permission);
export const getPermissionById = baseController.getOneById(Permission);
export const createPermission = baseController.createOne(Permission);
export const updatePermission = baseController.updateOne(Permission);
export const deletePermission = baseController.deleteOne(Permission);
