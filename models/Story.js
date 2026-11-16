import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
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
    date: {
      type: Date,
      default: Date.now,
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

const Story = mongoose.model('Story', storySchema);

export default Story;
