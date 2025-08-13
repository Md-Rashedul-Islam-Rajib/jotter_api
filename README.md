# Jotter API

A robust backend API system for managing storage management records with complete CRUD functionality.

## 🌟 Live Demo

**Backend URL:** (https://jotter-apis.vercel.app)

## 🛠️ Tech Stack

- **Backend Framework:** Express.js with TypeScript
- **Database:** MongoDB
- **ORM:** Mongoose
- **Deployment:** Vercel

## ✨ Key Features

- **Storage Management:** Create, read, update and delete customer information
- **User Management:** User manages associated with their storages


## 📋 API Features & Endpoints

### User Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new user |
| `POST` | `/auth/login` | login into site |
| `POST` | `/auth/forgot-password` | Get a OTP for verify user to reset password |
| `POST` | `/auth/verify-otp` | verify OTP for reset password |
| `POST` | `/auth/reset-password` | reset password |

### Storage Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/upload` | upload a file |
| `POST` | `/files/folder` | upload a folder |
| `POST` | `/files/duplicate/:id` | duplicate a file |
| `PATCH` | `/files/rename/:id` | rename a file |
| `PATCH` | `/files/private/:id` | toggle file private-public status |
| `PATCH` | `/files/favorite/:id` |  toggle file favorite status|
| `DELETE` | `/files/:id` |  delete a file|

### File Management

| Method | Endpoint | Description |
|--------|----------|-------------|

| `GET` | `/files` | get all files |
| `GET` | `/files?type=image` | get all image files |
| `GET` | `/files?type=pdf` | get all pdf files |
| `GET` | `/files?type=text` | get all text files |
| `GET` | `/files?type=folder` | get all folders |
| `GET` | `/files?type=html` | get all html file |
| `GET` | `/files?type=other` | get all other file |
| `GET` | `/files/storage` | get storage information |
## 📥 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- npm, pnpm, bun or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Md-Rashedul-Islam-Rajib/jotter_api
   cd jotter_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
  NODE_ENV=development
  DB_URL=your_mongdb_url
  DEFAULT_PASSWORD=password
  SALT_ROUND=12
  JWT_ACCESS_SECRET=jwt_secret
  JWT_REFRESH_SECRET=jwt_secret
  JWT_ACCESS_EXPIRES_IN=1d
  JWT_REFRESH_EXPIRES_IN=10d
  SENDER_EMAIL=sender_email
  SENDER_APP_PASSWORD=app_password
  SENDER_NAME=sender_name
  CLOUDINARY_CLOUD_NAME=cloudinary_cloud_name
  CLOUDINARY_API_KEY=cloudinary_api_key
  CLOUDINARY_API_SECRET=cloudinary_api_secret
   ```


4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 👨‍💻 Authors

- Your Name - [GitHub Profile](https://github.com/Md-Rashedul-Islam-Rajib)

## 🙏 Acknowledgements

- Express.js Documentation
- Mongoose Documentation
- MongoDB Documentation