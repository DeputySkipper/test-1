# ReWear: Sustainable Clothing Exchange Platform

## Project Overview
ReWear is a web platform for sustainable clothing exchange. Users can register, log in, browse and swap clothing items, and interact with an AI assistant for help. The platform features a modern UI, product grid, category browsing, and a collapsible sidebar for navigation.

## Features
- User registration and login
- Product listing and browsing
- Category-based navigation
- Collapsible sidebar
- AI-powered chatbot assistant
- Responsive design
- Image upload and management

## Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node Package Manager)
- Git
- A MongoDB database (MongoDB Atlas or local)

## Getting Started

### 1. Clone the Repository
```
git clone <repository-url>
cd ReWear
```

### 2. Install Dependencies
```
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory. You can use the provided `ENVIRONMENT_VARIABLES.md` as a reference. Required variables include:
- `MONGODB_URI` (your MongoDB connection string)
- `JWT_SECRET` (a secret key for authentication)
- Optional: Email and Cloudinary settings for advanced features

### 4. Run the Application Locally
```
npm start
```
The app will be available at `http://localhost:3000` by default.

### 5. Access the Platform
- Open your browser and go to `http://localhost:3000`
- Register a new user or log in with existing credentials
- Browse, add, or swap items
- Use the sidebar and chatbot for navigation and assistance

## Deployment Guide (Vercel)

### Deploying to Vercel
1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and sign up or log in.
3. Import your GitHub repository as a new project.
4. Set the following in the Vercel dashboard:
   - **Root Directory:** `/` (project root)
   - **Build Command:** leave empty (Vercel auto-detects)
   - **Output Directory:** leave empty
   - **Install Command:** `npm install`
5. Add your environment variables in the Vercel project settings (see above).
6. Deploy the project. Vercel will provide a public URL for your site.

### Notes for Assessors and Viewers
- All images must be placed in the `public/images/` directory with correct filenames and extensions.
- The backend (API) and frontend are served together from the same Express app for simplicity.
- The sidebar is collapsible via the hamburger button at the top left.
- The chatbot is available on all pages for user assistance.

## Troubleshooting
- If images do not appear, verify the filenames and extensions in `public/images/` match those referenced in the code.
- If the backend features (login, registration) do not work, ensure your environment variables are set correctly and MongoDB is accessible.
- For deployment issues, check the Vercel build logs and environment variable configuration. 