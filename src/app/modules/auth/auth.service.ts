import crypto from 'crypto';
import { StatusFullError } from '../../class/statusFullError';
import { UserModel } from '../user/user.model';
import { TUser } from '../user/user.types';
import { TLoginUser } from './auth.types';
import { createToken, preValidatingUser } from './auth.utilities';
import config from '../../config';
import bcrypt from 'bcrypt';
import QueryBuilder from '../../builder/queryBuilder';
import nodemailer from "nodemailer";
import { EmailHelper } from '../../utilities/emailHelper';

export class AuthServices {
  static async registerUser(payload: TUser) {
    const userExists = await UserModel.isUserExists(payload.email);
    if (userExists) {
      throw new Error('this user already registered');
    }
    const data = await UserModel.create(payload);
    const { _id, user_name, email } = data;
    const result = { _id, user_name, email };
    return result;
  }

  static async loginUser(payload: TLoginUser) {
    console.log(payload);
    const user = await preValidatingUser(payload.email);
    
  

    const isPasswordCorrect = await UserModel.isPasswordMatched(
      payload?.password,
      user?.password,
    );

    if (!isPasswordCorrect) {
      throw new StatusFullError(
        'AuthenticationError',
        'Password is incorrect',
        true,
        401,
      );
    }

    const jwtPayload = {
      email: user.email,

      userId:user._id
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expires_in,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret,
      config.jwt_refresh_expires_in,
    );

    return {
      accessToken,
      refreshToken,
      email: user.email,
      userId:user._id
    };
  }
  static async getAllUsers(query: Record<string, unknown>) {
    const userQuery = UserModel.find({ isDeleted: { $ne: true } });
    const queryBuilder = new QueryBuilder(userQuery, query);

    const result = await queryBuilder.modelQuery;

    return result;
  }

  

  static async updateUser(updatedData: Partial<TUser>) {
    const response = await UserModel.findOneAndUpdate(
      {
        email: updatedData?.email,
      },
      updatedData,
      { new: true },
    );
    return response;
  }

  static async getSingleUser(id: string) {
    const response = await UserModel.findById(id);
    return response;
  }

 
    static async deleteUser(id: string) {
      const result = await UserModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true, runValidators: true },
      );
      return result;
    }

  static async changePassword(updatedData: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const { email, currentPassword, newPassword } = updatedData;
    const user = await UserModel.isUserExists(email);
    const passwordMatched = UserModel.isPasswordMatched(
      currentPassword,
      user.password,
    );
    if (!passwordMatched) {
      throw new Error('Current password is incorrect');
    }

    const newHashedPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds),
    );

    await UserModel.findOneAndUpdate(
      { email },
      { password: newHashedPassword },
    );
    return { message: 'Password updated successfully' };
  }

  static async sendPasswordResetOTP(email: string) {
    const user = await UserModel.isUserExists(email);
    if (!user) {
      throw new StatusFullError(
        "NotFoundError",
        "User not found with this email",
        true,
        404
      )
    }


    const otp = crypto.randomInt(100000,999999).toString();
    const otpExpiration = new Date(Date.now() + 15 * 60 * 1000);


    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiration = otpExpiration;
    await user.save();


    await EmailHelper.sendEmail(
      email,
      'Password Reset OTP',
      'OTPEmail',
      { otp }, 
    );
    return { message: `OTP sent to this mail address : ${email}` };
  }

  static async verifyPasswordResetOTP(email: string, otp: string) {
    const user = await UserModel.isUserExists(email);
    if (!user) {
      throw new StatusFullError(
        "NotFoundError",
        "User not found with this email",
        true,
        404
      )
    }

    if (user.passwordResetOTP !== otp) {
      throw new StatusFullError(
        "AuthenticationError",
        "Invalid OTP",
        true,
        401
      );
    }

    user.passwordResetOTPVerified = true;
    await user.save();

    return {message: "OTP verified successfully"};
  }
  
  static async resetPassword(email: string, newPassword: string) {
    const user = await UserModel.isUserExists(email);
    if (!user) {
      throw new StatusFullError(
        "NotFoundError",
        "User not found with this email",
        true,
        404
      )
    }

    if (!user.passwordResetOTPVerified) {
      throw new StatusFullError(
        "AuthenticationError",
        "OTP not verified",
        true,
        401
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds),
    );

    user.password = hashedPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiration = undefined;
    user.passwordResetOTPVerified = false;

    await user.save();

    return { message: 'Password reset successfully' };
  }
}
