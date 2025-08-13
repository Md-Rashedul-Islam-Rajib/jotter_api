import { Router } from "express";
import { upload } from "../../config/cloudinary";
import { UploadController } from "./upload.controller";

const UploadRouter: Router = Router();

UploadRouter.post('/upload', upload.array('images', 10), UploadController.uploadImages);

export default UploadRouter;