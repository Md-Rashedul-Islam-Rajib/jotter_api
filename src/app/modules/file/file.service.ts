import { FileModel } from './file.model';
import { UserModel } from '../user/user.model';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utilities/cloudinary';
import { StatusFullError } from '../../class/statusFullError';
import config from '../../config';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileServices {
  static async uploadFile(
    userId: string,
    file: Express.Multer.File,
    body: any,
  ) {
    // Check storage space
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.usedStorage + file.size > user.storageLimit) {
      throw new StatusFullError(
        'StorageError',
        'Not enough storage space',
        true,
        400,
      );
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, {
      folder: `jotter/users/${userId}`,
      resource_type: 'auto',
      filename_override: file.originalname,
      use_filename: true,
      unique_filename: false,
    });

    // Create file record
    const newFile = await FileModel.create({
      name: file.originalname,
      type: this.getFileType(file.mimetype),
      size: file.size,
      path: result?.secure_url,
      publicId: result?.public_id,
      owner: userId,
      isPrivate: body.isPrivate || false,
      password: body.password || undefined,
      metadata: {
        mimetype: file.mimetype,
        originalName: file.originalname,
        cloudinary: result,
      },
    });

    // Update user storage
    user.usedStorage += file.size;
    await user.save();

    return newFile;
  }
  static getFileType(
    mimetype: string,
  ): any | 'text' | 'image' | 'pdf' | 'folder' | 'html' | 'other' {
    throw new Error('Method not implemented.');
  }

  static async deleteFile(userId: string, fileId: string) {
    const file = await FileModel.findOne({ _id: fileId, owner: userId });
    if (!file) throw new Error('File not found');

    // Delete from Cloudinary if it's not a folder
    if (file.type !== 'folder' && file.publicId) {
      await deleteFromCloudinary(file.publicId);
    }

    // Update user storage
    const user = await UserModel.findById(userId);
    if (user) {
      user.usedStorage -= file.size;
      await user.save();
    }

    await FileModel.deleteOne({ _id: fileId });
  }

  static async duplicateFile(userId: string, fileId: string) {
    const originalFile = await FileModel.findOne({
      _id: fileId,
      owner: userId,
    });
    if (!originalFile) throw new Error('File not found');

    // Check storage space
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.usedStorage + originalFile.size > user.storageLimit) {
      throw new StatusFullError(
        'StorageError',
        'Not enough storage space',
        true,
        400,
      );
    }

    // For Cloudinary files, we need to create a new upload
    let newPath = originalFile.path;
    let publicId = originalFile.publicId;

    if (originalFile.publicId) {
      const result = await uploadToCloudinary(
        await this.getFileBufferFromCloudinary(originalFile.publicId),
        {
          folder: `jotter/users/${userId}`,
          resource_type:
            originalFile.metadata?.cloudinary?.resource_type || 'auto',
          filename_override: `${originalFile.name}-copy`,
          use_filename: true,
        },
      );
      newPath = result.secure_url;
      publicId = result.public_id;
    }

    // Create copy in database
    const newFile = await FileModel.create({
      ...originalFile.toObject(),
      _id: undefined,
      name: `${originalFile.name} (copy)`,
      path: newPath,
      publicId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update user storage
    user.usedStorage += originalFile.size;
    await user.save();

    return newFile;
  }

  static async getStorageInfo(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    return {
      totalStorage: user.storageLimit,
      usedStorage: user.usedStorage,
      availableStorage: user.storageLimit - user.usedStorage,
    };
  }

  static async renameFile(userId: string, fileId: string, newName: string) {
    const file = await FileModel.findOne({ _id: fileId, owner: userId });
    if (!file) throw new Error('File not found');

    file.name = newName;
    return await file.save();
  }
  static async getFiles(userId: string, query: any) {
    const filter: any = { owner: userId };

    // Apply filters
    if (query.type) filter.type = query.type;
    if (query.favorite) filter.isFavorite = query.favorite === 'true';
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    if (query.parentFolder) filter.parentFolder = query.parentFolder;

    // Sorting
    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest first
    }

    return await FileModel.find(filter).sort(sort);
  }
  static async togglePrivate(
    userId: string,
    fileId: string,
    password?: string,
  ) {
    const file = await FileModel.findOne({ _id: fileId, owner: userId });
    if (!file) throw new Error('File not found');

    file.isPrivate = !file.isPrivate;
    if (file.isPrivate && password) {
      file.password = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds),
      );
    } else {
      file.password = undefined;
    }

    return await file.save();
  }
  static async createFolder(
    userId: string,
    name: string,
    parentFolder?: string,
  ) {
    return await FileModel.create({
      name,
      type: 'folder',
      size: 0,
      path: `folders/${uuidv4()}`,
      parentFolder,
      owner: userId,
    });
  }

  static async toggleFavorite(userId: string, fileId: string) {
    const file = await FileModel.findOne({ _id: fileId, owner: userId });
    if (!file) throw new Error('File not found');

    file.isFavorite = !file.isFavorite;
    return await file.save();
  }
  private static generateFilePath(
    userId: string,
    originalName: string,
  ): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    return `users/${userId}/${baseName}-${uuidv4()}${ext}`;
  }
}
  