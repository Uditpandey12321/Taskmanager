import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager').then(async () => {
  await mongoose.connection.collection('users').updateMany({}, { $set: { isVerified: true } });
  console.log('Migrated existing users to isVerified: true');
  process.exit(0);
});
