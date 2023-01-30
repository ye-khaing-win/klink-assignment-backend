import mongoose from "mongoose";

const connectDB = async () => {
  const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );

  await mongoose.connect(DB);
  console.log("Database connection successful");
};

export default connectDB;
