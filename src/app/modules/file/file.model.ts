import { model, Schema } from "mongoose";
import { TFile } from "./file.types";

const fileSchema = new Schema<TFile>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['image', 'pdf', 'text', 'folder', 'html', 'other'],
    },
    size: { type: Number, required: true, default: 0 },
    path: { type: String, required: true },
    publicId: { type: String, select: false },
    createdAt: { type: Date, default: Date.now },
    parentFolder: { type: Schema.Types.ObjectId, ref: 'File' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isFavorite: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    password: { type: String, select: false },
    tags: [{ type: String }],
    metadata: { type: Object },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const FileModel = model<TFile>('File', fileSchema);