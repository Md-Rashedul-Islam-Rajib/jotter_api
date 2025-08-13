import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { UploadServices } from "./upload.service";

export class UploadController {
    static uploadImages = catchAsync(async (req, res) => {
        const filePath = (req.file as any)?.path;
        const result = await UploadServices.uploadImageToCloudinary(filePath);

        sendResponse(res, 200, true, 'Image uploaded successfully', {
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
    })
}