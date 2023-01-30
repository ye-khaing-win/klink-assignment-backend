import crypto from 'crypto';
import User from '../../models/auth/userModel.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import sendEmail from '../../utils/sendEmail.js';
import * as helpers from '../../utils/helpers.js';
import Role from '../../models/auth/roleModel.js';

// SEND COOKIE RESPONSE
const sendCookieResponse = (user, statusCode, res) => {
  // 1) Generate JWT token
  const token = user.getSignedToken();

  // 2) Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // 3) Hide user password
  user.password = undefined;

  // 4) Send JWT token via cookie
  res.status(statusCode).cookie('token', token, cookieOptions).json({
    status: 'success',
    token,
    data: user,
  });
};

// SIGN UP FOR ADMIN ROLE
export const signupAdmin = catchAsync(async (req, res, next) => {
  // 1) Sanitize input data
  const { name, email, password, confirmPassword, passwordChangedAt } =
    req.body;

  // 2) Check admin role exists
  const userRole = await Role.findOne({ type: 'admin' });

  if (!userRole) {
    return next(
      new AppError(
        'No admin role found. Please define a role with "type: admin" and try again.'
      )
    );
  }

  // 3) Create new user
  const newUser = await User.create({
    name,
    email,
    roleId: userRole._id,
    password,
    confirmPassword,
    passwordChangedAt,
  });

  // 4) Generate JWT token and send via cookie
  sendCookieResponse(newUser, 201, res);
});

// SIGN UP FOR GENERAL USER
export const signupUser = catchAsync(async (req, res, next) => {
  // 1) Sanitize input data
  const { name, email, password, confirmPassword, passwordChangedAt } =
    req.body;

  // 2) Check user role exists
  const userRole = await Role.findOne({ type: 'user' });

  if (!userRole) {
    return next(
      new AppError(
        'No user role found. Please define a role with "type: user" and try again.'
      )
    );
  }

  // 3) Create new user
  const newUser = await User.create({
    name,
    email,
    roleId: userRole._id,
    password,
    confirmPassword,
    passwordChangedAt,
  });

  // 4) Generate JWT token and send via cookie
  sendCookieResponse(newUser, 201, res);
});

// LOGIN
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password provided
  if (!email && !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exits
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Check if password matchs
  const isPasswordMatched = await user.checkPasswordMatched(password);

  if (!isPasswordMatched) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everythin ok, generate JWT token and send via cookie
  sendCookieResponse(user, 200, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on provided email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Generate reset token
  const resetToken = user.getPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send token via email

  let message = `You are receiving this email because you has requested the reset of a password.Please use the following token to reset password. \n\n Reset Token: ${resetToken}`;

  try {
    await sendEmail({
      recipients: [user.email],
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });
  } catch (error) {
    user.passwordResetWebToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not sent. Please try again', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ passwordResetWebToken: hashedToken });

  // 2) If the token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetWebToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Log the user in and send JWT via cookie
  sendCookieResponse(user, 200, res);
});

export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Check if password is provided
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Password could not be changed here', 400));
  }

  // 2) Filter out unwanted field names that are not allowed to be updated
  const filteredBody = helpers.filterObj(req.body, 'name', 'email');

  // 2) Update user
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, passwordConfirm } = req.body;
  // 1) Get user from database
  const user = await User.findById(req.user._id).select('+password');

  // 2) Check if current password is correct
  const isPasswordMatched = await user.checkPasswordMatched(password);

  if (!isPasswordMatched) {
    return next(new AppError('Incorrect password', 401));
  }
  // 3) Update password

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;

  await user.save();
  // 4) Log user in and send JWT via cookie
  sendCookieResponse(user, 200, res);
});
