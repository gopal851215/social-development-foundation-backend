import Gallery from '../models/Gallery.js';
import { deleteMediaFile, getMediaUrl } from '../config/gridFs.js';

export const getGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

export const createGalleryItem = async (req, res, next) => {
  const file = req.files?.image?.[0];

  try {
    if (!file) {
      return res.status(400).json({ success: false, message: 'Media file is required' });
    }

    const { title, category } = req.body;

    const item = await Gallery.create({
      title,
      category: category || 'Other',
      imageUrl: getMediaUrl(file.id),
      mediaType: file.mimetype.startsWith('video/') ? 'video' : 'image',
      fileId: String(file.id),
    });

    res.status(201).json({ success: true, message: 'Gallery item uploaded successfully', data: item });
  } catch (error) {
    if (file) await deleteMediaFile(file.id);
    next(error);
  }
};

export const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    await Gallery.findByIdAndDelete(req.params.id);
    await deleteMediaFile(item.fileId);
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
