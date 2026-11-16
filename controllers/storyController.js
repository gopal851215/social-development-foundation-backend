import Story from '../models/Story.js';
import { deleteMediaFile, getMediaUrl } from '../config/gridFs.js';

const uploadedFiles = (files = {}) => [
  ...(files.images || []),
  ...(files.video || []),
];

const cleanupUploadedFiles = async (files) => {
  await Promise.allSettled(files.map((file) => deleteMediaFile(file.id)));
};

export const getStories = async (req, res, next) => {
  try {
    const stories = await Story.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: stories });
  } catch (error) {
    next(error);
  }
};

export const getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
};

export const createStory = async (req, res, next) => {
  const files = uploadedFiles(req.files);

  try {
    const { title, category, description, date, videoUrl } = req.body;
    const images = (req.files?.images || []).map((file) => ({
      url: getMediaUrl(file.id),
      fileId: String(file.id),
    }));
    const video = req.files?.video?.[0];

    const story = await Story.create({
      title,
      category,
      description,
      date: date || Date.now(),
      images,
      videoUrl: video ? getMediaUrl(video.id) : (videoUrl || ''),
      videoFileId: video ? String(video.id) : '',
    });

    res.status(201).json({ success: true, message: 'Story created successfully', data: story });
  } catch (error) {
    await cleanupUploadedFiles(files);
    next(error);
  }
};

export const updateStory = async (req, res, next) => {
  const files = uploadedFiles(req.files);

  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      await cleanupUploadedFiles(files);
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const images = [
      ...(story.images || []),
      ...(req.files?.images || []).map((file) => ({
        url: getMediaUrl(file.id),
        fileId: String(file.id),
      })),
    ];
    const video = req.files?.video?.[0];
    let nextVideoUrl = story.videoUrl || '';
    let nextVideoFileId = story.videoFileId || '';

    if (video) {
      nextVideoUrl = getMediaUrl(video.id);
      nextVideoFileId = String(video.id);
    } else if (req.body.videoUrl !== undefined && req.body.videoUrl !== story.videoUrl) {
      nextVideoUrl = req.body.videoUrl;
      nextVideoFileId = '';
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        date: req.body.date || story.date,
        images,
        videoUrl: nextVideoUrl,
        videoFileId: nextVideoFileId,
      },
      { new: true }
    );

    if (story.videoFileId && story.videoFileId !== nextVideoFileId) {
      await deleteMediaFile(story.videoFileId);
    }

    res.json({ success: true, message: 'Story updated successfully', data: updatedStory });
  } catch (error) {
    await cleanupUploadedFiles(files);
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    await Promise.allSettled([
      ...(story.images || []).map((image) => deleteMediaFile(image.fileId)),
      deleteMediaFile(story.videoFileId),
    ]);

    await Story.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    next(error);
  }
};
