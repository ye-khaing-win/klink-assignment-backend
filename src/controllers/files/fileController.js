import path from 'path';
import sharp from 'sharp';
import pluralize from 'pluralize';
import * as s3Client from '@aws-sdk/client-s3';
import * as s3Request from '@aws-sdk/s3-request-presigner';
import * as helpers from '../../utils/helpers.js';
import File from '../../models/files/fileModel.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import APIFeatures from '../../utils/ApiFeatures.js';

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new s3Client.S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: bucketRegion,
});

export const getAllFiles = catchAsync(async (req, res, next) => {
  const count = await File.countDocuments();

  const features = new APIFeatures(File.find(), req.query)
    .filter()
    .sort()
    .select()
    .populate()
    .paginate(count);

  let files = await features.query;

  files = await Promise.all(
    files.map(async (file) => {
      const command = new s3Client.GetObjectCommand({
        Bucket: bucketName,
        Key: file.name,
      });

      const url = await s3Request.getSignedUrl(s3, command, {
        expiresIn: 3600,
      });

      file.url = url;

      return file;
    })
  );

  res.status(200).json({
    status: 'success',
    result: files.length,
    pagination: features.pagination,
    data: files,
  });
});

export const getFileById = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(File.findById(req.params.id), req.query)
    .select()
    .populate();

  const file = await features.query;

  if (!file) return next(new AppError('No document found with that ID', 404));

  const command = new s3Client.GetObjectCommand({
    Bucket: bucketName,
    Key: file.name,
  });

  const url = await s3Request.getSignedUrl(s3, command, {
    expiresIn: 3600,
  });

  file.url = url;

  res.status(200).json({
    status: 'success',
    data: file,
  });
});

export const createFiles = catchAsync(async (req, res, next) => {
  const files = req.files;
  console.log(req.user);
  // 1) Check if files exist
  if (files?.length <= 0) {
    return next(new AppError('Please upload files', 400));
  }

  // 2) Get newly created files
  const newFiles = await Promise.all(
    // 2.1) Define allowable extensions based on file type
    files.map(async (file) => {
      let allowableExtensions;
      switch (file.fieldname) {
        case 'image':
          allowableExtensions =
            process.env.ALLOWABLE_IMAGE_EXTENSIONS.split(',');
          break;
        case 'resume':
          allowableExtensions =
            process.env.ALLOWABLE_RESUME_EXTENSIONS.split(',');
          break;
        case 'cover-letter':
          allowableExtensions =
            process.env.ALLOWABLE_COVER_LETTER_EXTENSIONS.split(',');
          break;
        default:
          return next(
            new AppError(
              'Invalid key. Only available image, resume and cover-letter.',
              400
            )
          );
      }

      // 2.2) Check the extension is allowable
      const fileName = helpers.generateRandomFileName();
      const extension = path.extname(file.originalname);

      if (!helpers.isValidExtension(extension, allowableExtensions)) {
        return next(
          new AppError(
            `Invalid file. Only available ${allowableExtensions.join(', ')}.`,
            400
          )
        );
      }

      // 2.3) If the file is image, resize with sharp
      let buffer = file.buffer;
      if (file.fieldname === 'image') {
        buffer = await sharp(file.buffer)
          .resize({ height: 1920, width: 1080, fit: 'contain' })
          .toBuffer();
      }

      // 2.4) Upload to s3 bucket
      const command = new s3Client.PutObjectCommand({
        Bucket: bucketName,
        Key: `${pluralize(file.fieldname)}/${fileName}`,
        Body: buffer,
        ContentType: file.mimetype,
      });

      await s3.send(command);

      const url = await s3Request.getSignedUrl(s3, command, {
        expiresIn: 3600,
      });

      // 2.5) Save file on database
      return await File.create({
        name: fileName,
        type: file.mimetype,
        folder: pluralize(file.fieldname),
        url,
      });
    })
  );

  // 3) Check if file uploading success
  if (newFiles.length <= 0) {
    return next(new AppError('Something went wrong uploading files', 400));
  }

  // 4) Send response
  res.status(201).json({
    status: 'success',
    data: newFiles,
  });
});

export const deleteFile = catchAsync(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file) return next(new AppError('No document found with that ID', 404));

  const command = new s3Client.DeleteObjectCommand({
    Bucket: bucketName,
    Key: `${file.folder}/${file.name}`,
  });

  await s3.send(command);

  await file.delete();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
