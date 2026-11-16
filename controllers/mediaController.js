import mongoose from 'mongoose';
import { getMediaBucket } from '../config/gridFs.js';

const sendRangeError = (res, length) => {
  res.status(416).set('Content-Range', `bytes */${length}`).end();
};

export const streamMedia = async (req, res, next) => {
  try {
    if (!mongoose.mongo.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    const bucket = getMediaBucket();
    const id = new mongoose.mongo.ObjectId(req.params.id);
    const [file] = await bucket.find({ _id: id }).limit(1).toArray();

    if (!file) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    const length = file.length;
    const range = req.headers.range;
    const headers = {
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': file.metadata?.contentType || 'application/octet-stream',
      'Content-Disposition': 'inline',
    };

    if (!range) {
      res.set({ ...headers, 'Content-Length': length });
      bucket.openDownloadStream(id).on('error', next).pipe(res);
      return;
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);

    if (!match || (!match[1] && !match[2])) {
      return sendRangeError(res, length);
    }

    let start = match[1] ? Number(match[1]) : Math.max(length - Number(match[2]), 0);
    let end = match[2] && match[1] ? Math.min(Number(match[2]), length - 1) : length - 1;

    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= length) {
      return sendRangeError(res, length);
    }

    res.status(206).set({
      ...headers,
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${length}`,
    });
    bucket.openDownloadStream(id, { start, end: end + 1 }).on('error', next).pipe(res);
  } catch (error) {
    next(error);
  }
};