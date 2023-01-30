import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please add a name'],
    },
    type: {
      type: String,
      required: [true, 'Please add a type'],
    },
    folder: {
      type: String,
      required: [true, 'Please add a folder'],
      enum: ['images', 'resumes', 'cover-letters'],
    },
    url: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const File = mongoose.model('File', fileSchema);

export default File;
