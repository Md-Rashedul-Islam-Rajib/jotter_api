import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export default {
  port: process.env.PORT!,
  db_url: process.env.DB_URL!,
  bcrypt_salt_rounds: process.env.SALT_ROUND!,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  sender_email: process.env.SENDER_EMAIL!,
  sender_app_password: process.env.SENDER_APP_PASSWORD!,
  sender_name: process.env.SENDER_NAME!,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true
  }
};
