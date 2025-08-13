import { Schema } from "mongoose";

export type TFile = {
  name: string;
  type: 'image' | 'pdf' | 'text' | 'folder' | 'html' | 'other';
  size: number; 
  path: string;
  publicId?: string;
  parentFolder?: Schema.Types.ObjectId;
  owner: string;
  isFavorite: boolean;
  isPrivate: boolean;
  password?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}
