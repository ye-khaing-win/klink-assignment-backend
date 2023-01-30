import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please add a type'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    permissions: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Permission',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// MIDDLEWARES
roleSchema.pre(/^find/, function (next) {
  this.populate('permissions');
  next();
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
