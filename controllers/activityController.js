import Activity from '../models/Activity.js';
import { deleteMediaFile, getMediaUrl } from '../config/gridFs.js';

const uploadedFiles = (files = {}) => [
  ...(files.images || []),
  ...(files.video || []),
];

const cleanupUploadedFiles = async (files) => {
  await Promise.allSettled(files.map((file) => deleteMediaFile(file.id)));
};

export const getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

export const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  const files = uploadedFiles(req.files);

  try {
    const { title, category, description, location, date, beneficiaries, videoUrl } = req.body;
    const images = (req.files?.images || []).map((file) => ({
      url: getMediaUrl(file.id),
      fileId: String(file.id),
    }));
    const video = req.files?.video?.[0];

    const activity = await Activity.create({
      title,
      category,
      description,
      location,
      date: date || Date.now(),
      beneficiaries: Number(beneficiaries) || 0,
      images,
      videoUrl: video ? getMediaUrl(video.id) : (videoUrl || ''),
      videoFileId: video ? String(video.id) : '',
    });

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activity,
    });
  } catch (error) {
    await cleanupUploadedFiles(files);
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  const files = uploadedFiles(req.files);

  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      await cleanupUploadedFiles(files);
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const images = [
      ...(activity.images || []),
      ...(req.files?.images || []).map((file) => ({
        url: getMediaUrl(file.id),
        fileId: String(file.id),
      })),
    ];
    const video = req.files?.video?.[0];
    let nextVideoUrl = activity.videoUrl || '';
    let nextVideoFileId = activity.videoFileId || '';

    if (video) {
      nextVideoUrl = getMediaUrl(video.id);
      nextVideoFileId = String(video.id);
    } else if (req.body.videoUrl !== undefined && req.body.videoUrl !== activity.videoUrl) {
      nextVideoUrl = req.body.videoUrl;
      nextVideoFileId = '';
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        beneficiaries: Number(req.body.beneficiaries) || activity.beneficiaries || 0,
        date: req.body.date || activity.date,
        images,
        videoUrl: nextVideoUrl,
        videoFileId: nextVideoFileId,
      },
      { new: true }
    );

    if (activity.videoFileId && activity.videoFileId !== nextVideoFileId) {
      await deleteMediaFile(activity.videoFileId);
    }

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity,
    });
  } catch (error) {
    await cleanupUploadedFiles(files);
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    await Promise.allSettled([
      ...(activity.images || []).map((image) => deleteMediaFile(image.fileId)),
      deleteMediaFile(activity.videoFileId),
    ]);

    await Activity.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
};
