# ReWear - Complete Development Prompt

## 🎯 Project Overview

**ReWear** is a sustainable clothing exchange platform that enables users to swap clothing items through direct exchanges or a points-based system. The platform promotes sustainable fashion by reducing textile waste and encouraging community-driven clothing exchanges.

### Core Mission
- Reduce fashion waste through community exchanges
- Promote sustainable consumption habits
- Create a trusted platform for clothing swaps
- Build a community of environmentally conscious fashion enthusiasts

## 🏗️ Current Project State

### ✅ Completed Components
- **Backend Foundation**: Express server with MongoDB connection
- **Database Models**: User, Item, and Swap schemas with validation
- **API Routes**: Authentication, items, swaps, and user management
- **Frontend Pages**: Landing page, login, and registration forms
- **Styling**: CSS framework with sustainable color palette
- **Documentation**: Comprehensive README with setup instructions

### 🔄 In Progress
- User dashboard functionality
- Item browsing and search features
- Swap system implementation
- Admin panel development

### ❌ Missing Components
- Complete frontend pages (dashboard, browse, item-detail, add-item, admin)
- JavaScript functionality for dynamic features
- Image upload handling
- Real-time notifications
- Advanced search and filtering
- Points system implementation

## 🎨 Visual Design Requirements

### Design Inspiration
Base the visual design on the **W3Schools clothing store template** with sustainable fashion adaptations:

### Color Palette
- **Primary Green**: `#2E7D32` (Sustainability focus)
- **Secondary Amber**: `#FFC107` (Accent color)
- **Background**: `#F5F5F5` (Light gray)
- **Text**: `#333333` (Dark gray)
- **Cards**: `#FFFFFF` (White)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FF9800` (Orange)
- **Error**: `#F44336` (Red)

### Typography
- **Headers**: 'Roboto', sans-serif (Bold, clean)
- **Body**: 'Open Sans', sans-serif (Readable, friendly)
- **Accent**: 'Poppins', sans-serif (Modern, stylish)

### UI Components
- **Cards**: Rounded corners (8px), subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with user menu
- **Grid**: Responsive CSS Grid for item layouts

## 📱 UI Components & Screens

### 1. Landing Page (`index.html`)
**Current Status**: ✅ Complete
- Hero section with sustainability message
- Featured items showcase
- How it works section
- User testimonials
- Call-to-action buttons

### 2. Authentication Pages
**Current Status**: ✅ Complete
- **Login Page** (`login.html`): Email/password form
- **Registration Page** (`register.html`): User signup with validation

### 3. User Dashboard (`dashboard.html`)
**Status**: ❌ Missing - **PRIORITY 1**
```html
<!-- Required Sections -->
- User profile summary with avatar
- My Items (owned items with edit/delete)
- Pending Swaps (incoming/outgoing requests)
- Swap History (completed exchanges)
- Points Balance (if using points system)
- Recent Activity feed
- Quick Actions (add item, browse, settings)
```

### 4. Item Browsing (`browse.html`)
**Status**: ❌ Missing - **PRIORITY 2**
```html
<!-- Required Features -->
- Search bar with filters (category, size, condition)
- Grid layout of item cards
- Filter sidebar (categories, sizes, brands)
- Sort options (newest, price, popularity)
- Pagination or infinite scroll
- Quick view modal for items
```

### 5. Item Detail (`item-detail.html`)
**Status**: ❌ Missing - **PRIORITY 2**
```html
<!-- Required Sections -->
- Item image gallery
- Item details (title, description, condition)
- Owner information and rating
- Swap/Points options
- Similar items recommendations
- Item history (if available)
- Report/Flag options
```

### 6. Add Item (`add-item.html`)
**Status**: ❌ Missing - **PRIORITY 3**
```html
<!-- Required Form Fields -->
- Item photos (multiple upload)
- Title and description
- Category and subcategory
- Size, brand, condition
- Tags/keywords
- Swap preferences
- Points value (if applicable)
```

### 7. Admin Panel (`admin.html`)
**Status**: ❌ Missing - **PRIORITY 4**
```html
<!-- Required Sections -->
- Dashboard overview (users, items, swaps)
- User management (view, edit, ban)
- Item moderation (approve, reject, flag)
- Swap monitoring (disputes, completion)
- Platform statistics
- Content management
```

## 🔧 Technical Backend Requirements

### Current Stack
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Security**: bcryptjs, helmet, rate limiting

### Required Enhancements

#### 1. File Upload System
```javascript
// Implement Multer for image uploads
const multer = require('multer');
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
```

#### 2. Search & Filtering
```javascript
// MongoDB text search with filters
const searchItems = async (query, filters) => {
  const searchQuery = {
    $text: { $search: query },
    ...filters
  };
  return await Item.find(searchQuery).sort({ score: { $meta: "textScore" } });
};
```

#### 3. Points System
```javascript
// Points calculation and management
const calculatePoints = (item) => {
  const basePoints = 100;
  const conditionMultiplier = { 'excellent': 1.2, 'good': 1.0, 'fair': 0.8 };
  return Math.round(basePoints * conditionMultiplier[item.condition]);
};
```

#### 4. Real-time Features
```javascript
// WebSocket integration for notifications
const io = require('socket.io')(server);
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });
});
```

## 📊 Data Models

### Current Models Status
- ✅ **User Model**: Complete with authentication
- ✅ **Item Model**: Complete with validation
- ✅ **Swap Model**: Complete with status tracking

### Required Enhancements

#### 1. Enhanced User Model
```javascript
// Add missing fields
{
  points: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalSwaps: { type: Number, default: 0 },
  profileImage: String,
  preferences: {
    categories: [String],
    sizes: [String],
    brands: [String]
  }
}
```

#### 2. Points Transaction Model
```javascript
// New model for points tracking
const PointsTransaction = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['earned', 'spent', 'refunded'] },
  amount: Number,
  description: String,
  relatedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  createdAt: { type: Date, default: Date.now }
});
```

## 🔑 Key Features Implementation

### 1. Authentication System
**Status**: ✅ Complete
- JWT token-based authentication
- Password hashing with bcryptjs
- User registration and login
- Profile management

### 2. Item Management
**Status**: 🔄 Partially Complete
- ✅ CRUD operations for items
- ❌ Image upload handling
- ❌ Search and filtering
- ❌ Category management

### 3. Swap System
**Status**: 🔄 Partially Complete
- ✅ Swap request creation
- ✅ Status management (pending, accepted, completed)
- ❌ Points-based exchanges
- ❌ Dispute resolution
- ❌ Rating system

### 4. User Dashboard
**Status**: ❌ Missing
- Personal item management
- Swap history and tracking
- Points balance and transactions
- Activity feed

### 5. Admin Panel
**Status**: ❌ Missing
- User management
- Content moderation
- Platform analytics
- System settings

### 6. Search & Filter
**Status**: ❌ Missing
- Full-text search
- Category filtering
- Size and condition filters
- Advanced sorting options

## 🎨 Styling Guidelines

### CSS Architecture
```css
/* Base styles */
:root {
  --primary-color: #2E7D32;
  --secondary-color: #FFC107;
  --background-color: #F5F5F5;
  --text-color: #333333;
  --card-color: #FFFFFF;
}

/* Component styles */
.card {
  background: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1200px
- Flexible grid system
- Touch-friendly interactions

## 🚀 JavaScript Functionality

### Required JavaScript Files

#### 1. Main Application (`main.js`)
```javascript
// Global app state management
const App = {
  user: null,
  items: [],
  swaps: [],
  
  init() {
    this.checkAuth();
    this.setupEventListeners();
    this.loadInitialData();
  },
  
  checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchUserProfile();
    }
  }
};
```

#### 2. Authentication (`auth.js`)
```javascript
// Authentication utilities
const Auth = {
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  async register(userData) {
    // Registration logic
  },
  
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }
};
```

#### 3. Item Management (`items.js`)
```javascript
// Item CRUD operations
const Items = {
  async getAll(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/items?${queryString}`);
    return response.json();
  },
  
  async create(itemData) {
    const formData = new FormData();
    // Handle file uploads
    Object.keys(itemData).forEach(key => {
      formData.append(key, itemData[key]);
    });
    
    const response = await fetch('/api/items', {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
};
```

#### 4. Swap System (`swaps.js`)
```javascript
// Swap management
const Swaps = {
  async createSwap(itemId, offerType, offerData) {
    const response = await fetch('/api/swaps', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        itemId,
        offerType, // 'item' or 'points'
        offerData
      })
    });
    return response.json();
  }
};
```

## 🗄️ Database Seeding

### Sample Data Requirements
```javascript
// Seed data for development
const seedData = {
  users: [
    {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'password123',
      points: 250,
      rating: 4.8
    }
  ],
  
  items: [
    {
      title: 'Vintage Denim Jacket',
      description: 'Classic 90s denim jacket in excellent condition',
      category: 'Outerwear',
      size: 'M',
      condition: 'excellent',
      brand: 'Levi\'s',
      images: ['jacket1.jpg', 'jacket2.jpg']
    }
  ],
  
  categories: [
    'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'
  ]
};
```

## 🔒 Security Considerations

### Current Security Features
- ✅ Password hashing with bcryptjs
- ✅ JWT authentication
- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS configuration

### Required Enhancements
- Image upload validation
- XSS protection
- CSRF tokens
- Input sanitization
- File type restrictions

## 📋 Development Steps

### Phase 1: Complete Core Frontend (Week 1)
1. **Create missing HTML pages**
   - Dashboard page
   - Browse items page
   - Item detail page
   - Add item form
   - Admin panel

2. **Implement JavaScript functionality**
   - Authentication state management
   - Item CRUD operations
   - Search and filtering
   - Form validation

### Phase 2: Enhanced Backend Features (Week 2)
1. **File upload system**
   - Image upload handling
   - File validation and storage
   - Image resizing and optimization

2. **Search and filtering**
   - MongoDB text search
   - Advanced filtering options
   - Pagination implementation

### Phase 3: Swap System & Points (Week 3)
1. **Complete swap functionality**
   - Points-based exchanges
   - Swap status management
   - Dispute resolution

2. **User dashboard features**
   - Activity tracking
   - Points management
   - Swap history

### Phase 4: Admin Panel & Polish (Week 4)
1. **Admin functionality**
   - User management
   - Content moderation
   - Analytics dashboard

2. **Testing and optimization**
   - Performance optimization
   - Security testing
   - User experience improvements

## 🎯 Nice-to-Have Features

### Advanced Features
- **Real-time chat** between users during swaps
- **Email notifications** for swap updates
- **Social media integration** for sharing items
- **Mobile app** using React Native
- **AI-powered recommendations** based on user preferences
- **Virtual try-on** features using AR
- **Sustainability impact tracking** (CO2 saved, items diverted from landfill)
- **Community features** (forums, events, challenges)

### Technical Enhancements
- **Progressive Web App** (PWA) capabilities
- **Offline functionality** for browsing items
- **Push notifications** for new items and swap requests
- **Advanced analytics** and reporting
- **A/B testing** framework for UI improvements
- **Performance monitoring** and optimization

## 🚀 Deployment Strategy

### Development Environment
- Local MongoDB instance
- Node.js development server
- Hot reloading for frontend changes

### Production Environment
- **Hosting**: Heroku, Vercel, or AWS
- **Database**: MongoDB Atlas
- **CDN**: Cloudflare for static assets
- **Monitoring**: Sentry for error tracking

### CI/CD Pipeline
- GitHub Actions for automated testing
- Automated deployment on push to main branch
- Environment-specific configurations

## 📊 Success Metrics

### User Engagement
- User registration and retention rates
- Items listed and swapped per user
- Time spent on platform
- User satisfaction ratings

### Platform Performance
- Page load times
- API response times
- Database query performance
- Error rates and uptime

### Sustainability Impact
- Items diverted from landfill
- CO2 emissions saved
- Community engagement metrics
- User behavior changes

---

## 🎯 Next Steps

1. **Immediate Priority**: Complete the missing frontend pages (dashboard, browse, item-detail)
2. **Backend Enhancement**: Implement file upload and search functionality
3. **User Experience**: Add JavaScript interactivity and form validation
4. **Testing**: Comprehensive testing of all features
5. **Deployment**: Production-ready deployment with monitoring

This development prompt provides a comprehensive roadmap for completing the ReWear platform. The project has a solid foundation and clear direction for sustainable fashion innovation. 