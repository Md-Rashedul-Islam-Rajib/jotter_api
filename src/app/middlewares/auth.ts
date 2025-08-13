import jwt from 'jsonwebtoken';
import { TUserRole } from '../modules/user/user.types';
import config from '../config';
import catchAsync from '../utilities/catchAsync';
import { preValidatingUser } from '../modules/auth/auth.utilities';
import { CustomPayload } from '../..';

const auth = (...roles: TUserRole[]) => {
  return catchAsync(async (req, _res, next) => {
    const token = req.headers.authorization;

    // checking if the token is missing
    if (!token) {
      throw new Error('You are not authorized!');
    }

    // checking if the given token is valid
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as CustomPayload;

    const { email, role } = decoded;

    await preValidatingUser(email);

    if (roles && !roles.includes(role as TUserRole)) {
      throw new Error('you are not authorized');
    }

    req.user = decoded;
    next();
  });
};

export default auth;
