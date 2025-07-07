import mongoose, { Schema, models, model } from "mongoose";

export interface IImage {
  _id: mongoose.Types.ObjectId;
  title: string;
  imageUrl: string;
}

const imageSchema = new Schema<IImage>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const Image = models?.Image || model<IImage>("Image", imageSchema);

export default Image;
