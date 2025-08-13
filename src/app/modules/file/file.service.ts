import { FileModel } from './file.model';
import { UserModel } from '../user/user.model';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utilities/cloudinary';
import { StatusFullError } from '../../class/statusFullError';

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
    static getFileType(mimetype: string): any | "text" | "image" | "pdf" | "folder" | "html" | "other" {
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

  // private static async getFileBufferFromCloudinary(publicId: string) {
  //   const url = cloudinary.url(publicId, { flags: 'attachment' });
  //   const response = await fetch(url);
  //   return Buffer.from(await response.arrayBuffer());
  // }

  
}
  