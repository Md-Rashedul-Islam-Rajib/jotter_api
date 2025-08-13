import { Model } from 'mongoose';

export type TUser = {
  save: any;
  _id?: string;
  user_name: string;
  email: string;
  password: string;
  storageLimit: number,
  usedStorage: number,
  passwordResetOTP?: string;
  passwordResetOTPExpiration?: Date;
  passwordResetOTPVerified?: boolean;
};

export interface UserStatics extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExists(email: string, id?: string): Promise<TUser>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}


