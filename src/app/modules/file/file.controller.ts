
import catchAsync from '../../utilities/catchAsync';
import sendResponse from '../../utilities/sendResponse';
import { FileServices } from './file.service';
import { Request, Response } from 'express';

export class FileControllers {
  static uploadFile = catchAsync(async (req: Request, res: Response) => {
    const file = await FileServices.uploadFile(req.user!.email, req.file!, req.body);
    sendResponse(res, 201, true, 'File uploaded successfully', file);
  });

  static createFolder = catchAsync(async (req: Request, res: Response) => {
    const folder = await FileServices.createFolder(
      req.user!.email,
      req.body.name,
      req.body.parentFolder,
    );
    sendResponse(res, 201, true, 'Folder created successfully', folder);
  });

  static getFiles = catchAsync(async (req: Request, res: Response) => {
    const files = await FileServices.getFiles(req.user!.email, req.query);
    sendResponse(res, 200, true, 'Files retrieved successfully', files);
  });



    
  static toggleFavorite = catchAsync(async (req: Request, res: Response) => {
      console.log(req.user!.email, req.params.id)
      const file = await FileServices.toggleFavorite(req.user!.email, req.params.id);
      
    sendResponse(res, 200, true, 'Favorite status updated', file);
  });



    
  static togglePrivate = catchAsync(async (req: Request, res: Response) => {
    const file = await FileServices.togglePrivate(
      req.user!.email,
      req.params.id,
      req.body.password,
    );
    sendResponse(res, 200, true, 'Privacy status updated', file);
  });

  static renameFile = catchAsync(async (req: Request, res: Response) => {
    const file = await FileServices.renameFile(
      req.user!.email,
      req.params.id,
      req.body.newName,
    );
    sendResponse(res, 200, true, 'File renamed successfully', file);
  });

  static deleteFile = catchAsync(async (req: Request, res: Response) => {
    await FileServices.deleteFile(req.user!.email, req.params.id);
    sendResponse(res, 200, true, 'File deleted successfully');
  });

  static duplicateFile = catchAsync(async (req: Request, res: Response) => {
    const newFile = await FileServices.duplicateFile(
      req.user!.email,
      req.params.id,
    );
    sendResponse(res, 201, true, 'File duplicated successfully', newFile);
  });

  static getStorageInfo = catchAsync(async (req: Request, res: Response) => {
    const info = await FileServices.getStorageInfo(req.user!.email);
    sendResponse(res, 200, true, 'Storage info retrieved', info);
  });
}
