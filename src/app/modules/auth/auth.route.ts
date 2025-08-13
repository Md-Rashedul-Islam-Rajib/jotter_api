import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { userCreationSchema } from '../user/user.validation';
import { AuthControllers } from './auth.controller';

const AuthRouter: Router = Router();

AuthRouter.post(
  '/register',
  validateRequest(userCreationSchema),
  AuthControllers.registerUser,
);

AuthRouter.post('/login', AuthControllers.loginUser);
AuthRouter.put('/change-password', AuthControllers.changePassword);
AuthRouter.put('/update', AuthControllers.updateUser);
AuthRouter.get('/', AuthControllers.getUsers);
AuthRouter.get('/:id', AuthControllers.getSingleUser);
AuthRouter.post('/forgot-password', AuthControllers.forgotPassword);
AuthRouter.post('/verify-otp', AuthControllers.verifyOTP);
AuthRouter.post('/reset-password', AuthControllers.resetPassword);


export default AuthRouter;
