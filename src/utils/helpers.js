import crypto from 'crypto';

// FILTER OBJECT
export const filterObj = (obj, ...allowedFields) => {
  // 1) Create fresh object
  const newObj = {};

  // 2) Define allowable fields
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  // 3) Return filtered object
  return newObj;
};

export const generateRandomFileName = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const isValidExtension = (extension, allowableExtensions) => {
  return allowableExtensions.includes(extension);
};
