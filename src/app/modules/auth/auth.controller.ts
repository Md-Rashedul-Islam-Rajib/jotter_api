import catchAsync from '../../utilities/catchAsync';
import sendResponse from '../../utilities/sendResponse';
import { AuthServices } from './auth.service';

export class AuthControllers {
  static registerUser = catchAsync(async (req, res) => {
    const data = await AuthServices.registerUser(req.body);
    sendResponse(res, 201, true, 'User registered Successfully', data);
  });

  static loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body);

    const { refreshToken, accessToken, email } = result;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });

    const data = { token: accessToken, email };
    sendResponse(res, 200, true, 'Login successful', data);
  });

  static changePassword = catchAsync(async (req, res) => {
    const data = await AuthServices.changePassword(req.body);
    sendResponse(res, 200, true, 'Password updated successfully', data);
  });
  static updateUser = catchAsync(async (req, res) => {
    const data = await AuthServices.updateUser(req.body);
    sendResponse(res, 200, true, 'User updated successfully', data);
  });

  static getUsers = catchAsync(async (req, res) => {
    const data = await AuthServices.getAllUsers(req.query);
    sendResponse(res, 200, true, 'Users retrieved successfully', data);
  });
  static getSingleUser = catchAsync(async (req, res) => {
    const data = await AuthServices.getSingleUser(req.params.id);
    console.log(data);
    sendResponse(res, 200, true, 'User retrieved successfully', data);
  });

  static deleteUser = catchAsync(async (req, res) => {
    const data = await AuthServices.deleteUser(req.params.id);
    sendResponse(res, 200, true, 'User deleted successfully', data);
  });

  static forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    await AuthServices.sendPasswordResetOTP(email);
    sendResponse(res, 200, true, 'OTP sent to your email');
  });

  static verifyOTP = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    await AuthServices.verifyPasswordResetOTP(email, otp);
    sendResponse(res, 200, true, 'OTP verified successfully');
  });

  static resetPassword = catchAsync(async (req, res) => {
    const { email, newPassword } = req.body;
    const data = await AuthServices.resetPassword(email, newPassword);
    sendResponse(res, 200, true, 'Password reset successfully', data);
  });
}
