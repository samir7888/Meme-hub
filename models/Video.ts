import mongoose, { Schema, models, model } from "mongoose";

export const videoDimension = {
  width: 1080,
  height: 1920,
} as const;

export interface IVideo {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  controls?: boolean;

  transformation?: {
    width: number;
    height: number;
    quality?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: false },
    controls: { type: Boolean, default: true },
    transformation: {
        width: { type: Number, default: videoDimension.width },
        height: { type: Number, default: videoDimension.height },
        quality: { type: Number, min: 1, max: 100 },
    },
  },
  { timestamps: true }
);

const Video = models?.Video || model<IVideo>("Video", videoSchema);

export default Video;