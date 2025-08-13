import { Router } from 'express';
import AuthRouter from '../modules/auth/auth.route';
import UploadRouter from '../modules/upload/upload.route';
import FileRouter from '../modules/file/file.route';



const router: Router = Router();

const allRoutes = [
  {
    path: '/auth',
    route: AuthRouter,
  },
  {
    path: '/files',
    route: FileRouter
  }, {
    path: '/api',
    route: UploadRouter
  }
  
];

allRoutes.forEach((singleRoute) =>
  router.use(singleRoute.path!, singleRoute.route!),
);

export default router;