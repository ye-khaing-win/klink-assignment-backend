import multer from 'multer';
import path from 'path';
import AppError from '../utils/AppError.js';
import * as helpers from '../utils/helpers.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname);
  const allowableExtensions = process.env.ALLOWABLE_FILE_EXTENSIONS.split(',');

  if (helpers.isValidExtension(extension, allowableExtensions)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file, Only available ${allowableExtensions.join(', ')}.`,
        400
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
