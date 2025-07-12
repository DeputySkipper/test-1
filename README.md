# ReWear - Sustainable Clothing Exchange Platform

ReWear is a modern, sustainable clothing exchange platform that allows users to swap clothing items through direct exchanges or a points-based system. Built with Node.js, Express, MongoDB, and modern web technologies.

## 🌟 Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Item Management**: Upload, edit, and manage clothing items
- **Swap System**: Direct item swaps and points-based exchanges
- **Search & Filter**: Advanced search with category, size, and condition filters
- **User Dashboard**: Personal profile management and activity tracking
- **Admin Panel**: Content moderation and user management
- **Real-time Notifications**: Toast notifications and status updates

### Technical Features
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **RESTful API**: Clean, well-documented API endpoints
- **Security**: Password hashing, JWT authentication, input validation
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Image upload support for items and profiles
- **Search**: Full-text search with MongoDB text indexes

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rewear.git
   cd rewear
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/rewear
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🌐 Deployment Options

### Option 1: GitHub Pages + Backend Hosting (Recommended)

#### Frontend Deployment (GitHub Pages)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Click Save

3. **Update Configuration**
   Edit `public/js/config.js` and replace:
   - `your-backend-url.com` with your actual backend URL
   - `yourusername.github.io/rewear` with your GitHub Pages URL

#### Backend Deployment (Render - Free)

1. **Create Render Account**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `rewear-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment Variables**:
       - `MONGODB_URI`: Your MongoDB Atlas connection string
       - `JWT_SECRET`: Your JWT secret
       - `NODE_ENV`: `production`

3. **Update Frontend Config**
   - Copy your Render backend URL
   - Update `public/js/config.js` with the backend URL

### Option 2: Vercel Deployment (Full Stack)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Add your MongoDB URI and JWT secret in Vercel dashboard

### Option 3: Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Deploy**
   ```bash
   heroku create rewear-app
   git push heroku main
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   ```

## 📁 Project Structure

```
rewear/
├── public/                 # Frontend static files
│   ├── css/               # Stylesheets
│   │   ├── style.css      # Main styles
│   │   ├── components.css # Component styles
│   │   └── responsive.css # Responsive design
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Main application logic
│   │   ├── auth.js        # Authentication utilities
│   │   ├── config.js      # Environment configuration
│   │   ├── items.js       # Item management
│   │   ├── dashboard.js   # Dashboard functionality
│   │   └── admin.js       # Admin panel
│   ├── images/            # Static images
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # User dashboard
│   ├── browse.html        # Item browsing
│   ├── item-detail.html   # Item details
│   ├── add-item.html      # Add item form
│   └── admin.html         # Admin panel
├── server/                # Backend code
│   ├── models/            # Database models
│   │   ├── User.js        # User model
│   │   ├── Item.js        # Item model
│   │   └── Swap.js        # Swap model
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── items.js       # Item routes
│   │   ├── users.js       # User routes
│   │   └── swaps.js       # Swap routes
│   ├── middleware/        # Custom middleware
│   │   └── auth.js        # Authentication middleware
│   └── server.js          # Main server file
├── .github/               # GitHub Actions
│   └── workflows/         # Deployment workflows
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - User logout

### Items
- `GET /api/items` - Get all items with filters
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/like` - Toggle item like
- `GET /api/items/user/:userId` - Get user's items
- `GET /api/items/categories` - Get all categories

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps` - Get user's swaps
- `GET /api/swaps/:id` - Get swap by ID
- `PUT /api/swaps/:id/accept` - Accept swap
- `PUT /api/swaps/:id/reject` - Reject swap
- `PUT /api/swaps/:id/complete` - Complete swap
- `POST /api/swaps/:id/message` - Add message to swap
- `POST /api/swaps/:id/rate` - Rate completed swap

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/items` - Get user's items
- `GET /api/users/:id/stats` - Get user statistics
- `PUT /api/users/:id/admin` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/stats/overview` - Platform statistics (admin)

## 🎨 Design System

### Color Palette
- **Primary**: `#2E7D32` (Green for sustainability)
- **Secondary**: `#FFC107` (Amber for accent)
- **Background**: `#F5F5F5` (Light gray)
- **Text**: `#333333` (Dark gray)
- **Cards**: `#FFFFFF` (White)

### Typography
- **Headers**: 'Roboto', sans-serif
- **Body**: 'Open Sans', sans-serif

### Components
- Rounded corners (8px border-radius)
- Subtle shadows for depth
- Hover effects on interactive elements
- Responsive grid layouts
- Clean form styling

## 🔧 Configuration

### Environment Variables
```env
PORT=3000                          # Server port
MONGODB_URI=mongodb://localhost:27017/rewear  # MongoDB connection string
JWT_SECRET=your-secret-key         # JWT signing secret
NODE_ENV=development               # Environment mode
```

### Database Configuration
The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `items` - Clothing items and listings
- `swaps` - Exchange transactions

## 🧪 Testing

### Running Tests
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by sustainable fashion initiatives
- Built with modern web technologies
- Designed for community-driven clothing exchanges

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@rewear.com
- Documentation: [docs.rewear.com](https://docs.rewear.com)

## 🔮 Roadmap

### Upcoming Features
- [ ] Real-time chat between users
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Social media integration
- [ ] Advanced analytics
- [ ] Payment integration
- [ ] Shipping tracking
- [ ] Community features

### Future Enhancements
- [ ] AI-powered item recommendations
- [ ] Virtual try-on features
- [ ] Sustainability impact tracking
- [ ] Carbon footprint calculator
- [ ] Integration with fashion brands

---

**Made with ❤️ for sustainable fashion** 