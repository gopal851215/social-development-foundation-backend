import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Community-based support',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    beneficiaries: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: String,
        fileId: String,
      },
    ],
    videoUrl: {
      type: String,
      default: '',
    },
    videoFileId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
