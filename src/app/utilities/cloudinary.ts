import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

cloudinary.config(config.cloudinary);

export const uploadToCloudinary = async (buffer: Buffer, options: any = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  return await cloudinary.uploader.destroy(publicId);
};

export const extractPublicId = (url: string) => {
  const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
  return matches ? matches[1] : null;
};
