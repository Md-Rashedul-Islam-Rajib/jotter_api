import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { UserModel } from '../user/user.model';

export const createToken = (
  jwtPayload: { email: string},
  secret: string,
  expiresIn: string | number,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn ,
  });
};

export const verifyToken = (secret: string, token?: string) => {
  if (!token) {
    throw new Error("You're not authorized");
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (_error) {
    throw new Error('The provided token is invalid or expired');
  }
};

export const preValidatingUser = async (identifier: string) => {
  const user = await UserModel.isUserExists(identifier);
  if (!user) {
    throw new Error('this user is not found');
  }


  return user;
};
