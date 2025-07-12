# Environment Variables for Vercel Deployment

Set these environment variables in your Vercel project dashboard:

## Required Variables

### Database Configuration
- `MONGODB_URI` - Your MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/rewear`

### JWT Secret
- `JWT_SECRET` - Secret key for JWT token generation
  - Example: `your-super-secret-jwt-key-here`

### Email Configuration (Optional - for password reset, notifications)
- `EMAIL_HOST` - SMTP host (e.g., `smtp.gmail.com`)
- `EMAIL_PORT` - SMTP port (e.g., `587`)
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - Your email app password

### Cloudinary Configuration (Optional - for image uploads)
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Server Configuration
- `PORT` - Server port (Vercel sets this automatically)
- `NODE_ENV` - Environment (set to `production`)

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" tab
4. Click on "Environment Variables"
5. Add each variable with its value
6. Deploy again to apply changes 