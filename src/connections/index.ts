import mongoose from 'mongoose';

const DB = process.env.MONGODB_CONNECT_STRING.replace(
  '<user>',
  process.env.MONGODB_USER,
)
  .replace('<password>', process.env.MONGODB_PASSWORD)
  .replace('<database>', process.env.MONGODB_DATABASE);

mongoose.connect(DB).then(() => console.log('資料庫連接成功'));
