import { model, Schema } from 'mongoose';
import { TUser, UserStatics } from './user.types';
import config from '../../config';
import bcrypt from 'bcrypt';

const userSchema = new Schema<TUser>(
  {
    user_name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    storageLimit: {
      type: Number,
      default: 15*1024*1024*1024
    },
    usedStorage: {
      type: Number,
      default: 0
    },
    passwordResetOTP: {
      type: String,
      required: false,
    },
    passwordResetOTPExpiration: {
      type: Date,
      required: false,
    },
    passwordResetOTPVerified: {
      type: Boolean,
      default: false,
      required: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; 
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExists = async function (identifier: string) {
  // Check if the identifier is an email
  if (identifier.includes('@')) {
    return await UserModel.findOne({ email: identifier }).select('+password');
  } else {
    // Otherwise, treat it as an ID
    return await UserModel.findById(identifier).select('+password');
  }
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const UserModel = model<TUser, UserStatics>('user', userSchema);
