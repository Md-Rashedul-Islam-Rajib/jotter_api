import jwt from 'jsonwebtoken';

import config from '../config';
import catchAsync from '../utilities/catchAsync';
import { preValidatingUser } from '../modules/auth/auth.utilities';
import { CustomPayload } from '../..';


const auth = () => {
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

    const { email } = decoded;

    // Ensure user exists
    await preValidatingUser(email);

    // Attach user payload to request
    req.user = { email };

    next();
  });
};


export default auth;
