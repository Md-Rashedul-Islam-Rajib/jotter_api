import { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";

export class UploadServices {
  static async uploadImageToCloudinary(
    filePath: string,
  ): Promise<UploadApiResponse> {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'my-app/images', 
    });
    return result;
  }
}
