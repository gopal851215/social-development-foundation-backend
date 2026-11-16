import Member from '../models/Member.js';
import { deleteMediaFile, getMediaUrl } from '../config/gridFs.js';

export const getMembers = async (req, res, next) => {
  try {
    const members = await Member.find({}).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

export const createMember = async (req, res, next) => {
  const photo = req.files?.photo?.[0];

  try {
    const { name, designation, bio, displayOrder } = req.body;

    const member = await Member.create({
      name,
      designation,
      bio,
      photoUrl: photo ? getMediaUrl(photo.id) : '',
      fileId: photo ? String(photo.id) : '',
      displayOrder: Number(displayOrder) || 0,
    });

    res.status(201).json({ success: true, message: 'Member added successfully', data: member });
  } catch (error) {
    if (photo) await deleteMediaFile(photo.id);
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  const photo = req.files?.photo?.[0];

  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      if (photo) await deleteMediaFile(photo.id);
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        photoUrl: photo ? getMediaUrl(photo.id) : member.photoUrl,
        fileId: photo ? String(photo.id) : member.fileId,
        displayOrder: Number(req.body.displayOrder) || member.displayOrder || 0,
      },
      { new: true }
    );

    if (photo && member.fileId) await deleteMediaFile(member.fileId);

    res.json({ success: true, message: 'Member updated successfully', data: updatedMember });
  } catch (error) {
    if (photo) await deleteMediaFile(photo.id);
    next(error);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    await Member.findByIdAndDelete(req.params.id);
    await deleteMediaFile(member.fileId);
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
};
