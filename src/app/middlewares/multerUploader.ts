import multer from 'multer';
import { memoryStorage } from 'multer';

const storage = memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, 
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for now
    cb(null, true);
  },
});
export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, 
  },
  fileFilter: (req, file, cb) => {
    
    cb(null, true);
  },
}).single('file'); 