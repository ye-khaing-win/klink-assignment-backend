import { readFile } from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
// SEEDS
import Department from '../models/departmentModel.js';
import Experience from '../models/experienceModel.js';
import Industry from '../models/industryModel.js';
import JobFunction from '../models/jobFunctionModel.js';
import JobType from '../models/jobTypeModel.js';
import Permission from '../models/permissionModel.js';

// LOAD ENVIRONMENT VARIABLES
dotenv.config({ path: './../config/config.env' });

// VARIABLES
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// CONNECT TO DATABASE
try {
  await mongoose.connect(DB);
  console.log('Database connection successful');
} catch (error) {
  console.log('Database connection failed');
  process.exit();
}

// READ FILE
let docs;
let seed;
let Model;

switch (process.argv[3]) {
  case '--departments':
    seed = 'departments.json';
    Model = Department;
    break;
  case '--experiences':
    seed = 'experiences.json';
    Model = Experience;
    break;
  case '--industries':
    seed = 'industries.json';
    Model = Industry;
    break;
  case '--job-functions':
    seed = 'job-functions.json';
    Model = JobFunction;
    break;
  case '--job-types':
    seed = 'job-types.json';
    Model = JobType;
    break;
  case '--permissions':
    seed = 'permissions.json';
    Model = Permission;
    break;
}

try {
  docs = await readFile(path.join(__dirname, 'seeds', seed), 'utf-8');
} catch (error) {
  console.log(error);
  process.exit();
}

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Model.create(JSON.parse(docs));
    console.log('Data imported successfully');
  } catch (error) {
    console.log(error);
  }

  process.exit();
};

const deleteData = async () => {
  try {
    await Model.deleteMany();
    console.log('Data deleted successfully');
  } catch (error) {
    console.log(error);
  }

  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// node command should be just like:
// TO IMPORT - node .\seeder.js --import --seed
// TO DELETE - node .\seeder.js --delete --seed
