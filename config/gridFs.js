import mongoose from 'mongoose';

const bucketName = 'media';

export const getMediaBucket = () => {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error('MongoDB must be connected before media uploads are handled');
  }

  return new mongoose.mongo.GridFSBucket(database, { bucketName });
};

export const getMediaUrl = (fileId) => `/api/media/${fileId}`;

export const deleteMediaFile = async (fileId) => {
  if (!fileId || !mongoose.mongo.ObjectId.isValid(String(fileId))) return;

  const bucket = getMediaBucket();
  const id = new mongoose.mongo.ObjectId(fileId);
  const [file] = await bucket.find({ _id: id }).limit(1).toArray();

  if (file) {
    await bucket.delete(id);
  }
};