import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'Please add a key'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    action: {
      type: String,
      required: [true, 'Please add a an action'],
    },
  },
  {
    timestamps: true,
  }
);

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
