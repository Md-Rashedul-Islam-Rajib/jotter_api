import { Router } from 'express';
import { FileControllers } from './file.controller';
import auth from '../../middlewares/auth';
import { upload } from '../../middlewares/multerUploader';


const FileRouter: Router = Router();

FileRouter.post(
  '/upload',
  auth(),
  upload.single('file'),
  FileControllers.uploadFile,
);
FileRouter.post('/folder', auth(), FileControllers.createFolder);
FileRouter.get('/', auth(), FileControllers.getFiles);
FileRouter.patch('/favorite/:id', auth(), FileControllers.toggleFavorite);
FileRouter.patch('/private/:id', auth(), FileControllers.togglePrivate);
FileRouter.patch('/rename/:id', auth(), FileControllers.renameFile);
FileRouter.delete('/:id', auth(), FileControllers.deleteFile);
FileRouter.post('/duplicate/:id', auth(), FileControllers.duplicateFile);
FileRouter.get('/storage', auth(), FileControllers.getStorageInfo);

export default FileRouter;
