import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    imageId: {
      type: mongoose.Schema.ObjectId,
      ref: 'File',
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (val) {
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(val);
        },
        message: 'Please provide a valid email',
      },
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password should have more than or equal 8 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords are not the same',
      },
    },
    passwordChangedAt: Date,
    passwordResetWebToken: String,
    passwordResetExpires: Date,
    roleId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Role',
    },
  },
  {
    timestamps: true,
  }
);

// MIDDLEWARES
userSchema.pre(/^find/, function (next) {
  this.populate('roleId');

  next();
});

// ENCRYPT PASSWORD WITH BCRYPT
userSchema.pre('save', async function (next) {
  // 1) Check the password field is modified
  if (!this.isModified('password')) return next();

  // 2) Hash the password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // 3) Delte password confirm field
  this.passwordConfirm = undefined;

  next();
});

// UPDATE PASSWORD CHANGED TIMESTAMP
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  console.log('called');
  this.passwordChangedAt = Date.now();

  next();
});

// GENERATE JWT TOKEN
userSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// CHECK PASSWORD MATCHED
userSchema.methods.checkPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// CHECK PASSWORD CHANGED AFTER TOKEN ISSUED
userSchema.methods.checkPasswordChangedAfter = function (tokenIssuedAt) {
  if (this.passwordChangedAt) {
    return tokenIssuedAt * 1000 < this.passwordChangedAt.getTime();
  }

  return false;
};

// GENERATE RESET PASSWORD TOKEN
userSchema.methods.getPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetWebToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
