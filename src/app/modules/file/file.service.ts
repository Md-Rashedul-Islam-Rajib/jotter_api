import { StatusFullError } from './../../class/statusFullError';
import { FileModel } from './file.model';
import { UserModel } from '../user/user.model';
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../../utilities/cloudinary';
import config from '../../config';
import bcrypt from 'bcrypt';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TFile } from './file.types';

export class FileServices {
  static async uploadFile(
    email: string,
    file: Express.Multer.File,
    body: { isPrivate?: boolean; password?: string } = {},
  ) {
    // Checking storage space
    const user = await UserModel.findOne({ email });
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
      folder: `jotter/users/${email}`,
      resource_type: 'auto',
      filename_override: file.originalname,
      use_filename: true,
      unique_filename: false,
    }) as UploadApiResponse;

    // Create file record
    const newFile = await FileModel.create({
      name: file.originalname,
      type: FileServices.mapMimeType(file.mimetype),
      size: file.size,
      path: result?.secure_url,
      publicId: result?.public_id,
      owner: email,
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


  // checking file types
  static mapMimeType(mimetype: string): TFile['type'] {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype.startsWith('text/')) return 'text';
    if (mimetype === 'text/html') return 'html';
    return 'other';
  }


  // deleting file 
  static async deleteFile(email: string, fileId: string) {
    const file = await FileModel.findOne({ _id: fileId, owner: email });
    if (!file) throw new Error('File not found');

    // Delete from Cloudinary if it's not a folder
    if (file.type !== 'folder' && file.publicId) {
      await deleteFromCloudinary(file.publicId);
    }

    // Update user storage
    const user = await UserModel.findOne({ email });
    if (user) {
      user.usedStorage -= file.size;
      await user.save();
    }

    await FileModel.deleteOne({ _id: fileId });
  }


  // create copy of file
  static async duplicateFile(email: string, fileId: string) {
    const originalFile = await FileModel.findOne({
      _id: fileId,
      owner: email,
    });
    if (!originalFile) throw new Error('File not found');

    // Check storage space
    const user = await UserModel.findOne({ email });
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
          folder: `jotter/users/${email}`,
          resource_type:
            originalFile.metadata?.cloudinary?.resource_type || 'auto',
          filename_override: `${originalFile.name}-copy`,
          use_filename: true,
        },
      ) as UploadApiResponse;
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

  // get storage info
  static async getStorageInfo(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('User not found');

    return {
      totalStorage: user.storageLimit,
      usedStorage: user.usedStorage,
      availableStorage: user.storageLimit - user.usedStorage,
    };
  }

  static async renameFile(email: string, fileId: string, newName: string) {
    const file = await FileModel.findOne({ _id: fileId, owner: email });
    if (!file) throw new Error('File not found');

    file.name = newName;
    return await file.save();
  }
  static async getFiles(email: string, query: any) {
    const filter: any = { owner: email };

    if (query.type) filter.type = query.type;
    if (query.favorite) filter.isFavorite = query.favorite === 'true';
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    if (query.parentFolder) filter.parentFolder = query.parentFolder;

    if (query.date) {
      const selectedDate = new Date(query.date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Sorting
    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    return await FileModel.find(filter).sort(sort);
  }

  static async togglePrivate(email: string, fileId: string, password?: string) {
    const file = await FileModel.findOne({ _id: fileId, owner: email });
    if (!file) throw new Error('File not found');
    console.log(file.isPrivate);
    // File is private → making it public
    if (file.isPrivate) {
      if (!password) {
        throw new Error('Password is required to make this file public.');
      }
      console.log(file.password);
      // Check if password matches the hashed one
      const isMatch = await bcrypt.compare(password, file.password || '');
      if (!isMatch) {
        throw new Error('Incorrect password.');
      }

      // Make it public and remove password
      file.isPrivate = false;
      file.password = undefined;
      return await file.save();
    }

    //File is public → making it private
    else {
      if (!password) {
        throw new Error('Password is required to make this file private.');
      }

      file.isPrivate = true;
      file.password = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds),
      );
      return await file.save();
    }
  }

  static async createFolder(
    email: string,
    name: string,
    parentFolder?: string,
  ) {
    return await FileModel.create({
      name,
      type: 'folder',
      size: 0,
      path: `folders/${uuidv4()}`,
      parentFolder,
      owner: email,
    });
  }

  // toggle favorite 
  static async toggleFavorite(email: string, fileId: string) {
    const file = await FileModel.findOne({ _id: fileId, owner: email });
    if (!file) throw new Error('File not found');

    file.isFavorite = !file.isFavorite;
    return await file.save();
  }

  // Fetch file buffer from Cloudinary
  private static async getFileBufferFromCloudinary(publicId: string) {
    const url = cloudinary.url(publicId, { flags: 'attachment' });
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  }

  private static generateFilePath(email: string, originalName: string): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    return `users/${email}/${baseName}-${uuidv4()}${ext}`;
  }
}
