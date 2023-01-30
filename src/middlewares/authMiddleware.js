import util from 'util';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/auth/userModel.js';
import Role from '../models/auth/roleModel.js';

// PROTECT ROUTES
export const protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Check if JWT token provided
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }

  // 2) Check if JWT token exists
  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }

  // 3) Verify token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 4) Check if user exists
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  // 5) Check if user changed password after token was issued
  if (user.checkPasswordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );
  }

  // 6) SET USER DATA IN REQ OBJECT
  req.user = user;

  // GRANT ACCESS TO PROTECTED ROUTE

  next();
});

// AUTHORIZE ROUTES
export const authorize = (key, action) => {
  return catchAsync(async (req, res, next) => {
    // 1) Check the route is protected, If not (no req.user), grant access to the route
    if (!req.user?.roleId) {
      return next();
    }

    const role = req.user.roleId;

    // 2) Check the role is SuperAdmin, to grant full access
    if (role.type === 'admin') {
      return next();
    }

    // 3) Check the user is authorized
    const isAuthorized = role.permissions.find((permission) => {
      return permission.key === key && permission.action === action;
    });

    if (!isAuthorized) {
      return next(
        new AppError(
          `${role.name} role is unauthorized to perform this action`,
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    next();
  });
};
