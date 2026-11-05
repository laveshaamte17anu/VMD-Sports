# VMD SPORTS — Official Full-Stack Website & Management Platform

> **"Behind Every Great Match, There's a Story."**  
> Premium Cricket Media, Broadcast Live Streaming, Cameraman Roster Booking & Official Athletic Merchandise.

---

## 🏏 Overview

**VMD SPORTS** is an integrated full-stack digital platform for cricket media and lifestyle apparel. Built with a modern, high-octane dark sports aesthetic (black, white, and neon lime green), cinematic stadium visuals, smooth Framer Motion transitions, real MongoDB database collections, and a secure administrative command center.

### Core Ecosystem Capabilities
1. **Cricket Media & Cameraman Booking**: Production-grade booking request system for club derbies, corporate leagues, and state finals with automated reference generation (`VMD-YYYYMM-XXXX`) and live customer workflow tracking (`Pending` → `Under Review` → `Quotation Sent` → `Confirmed` → `Completed`).
2. **Live Streaming Broadcast Division**: Showcase multi-camera cinema setups (Sony FX6/FX3, 200-600mm telephoto optics, Blackmagic ATEM switchers, bonded 4G/5G uplinks) with a dedicated hotline configurable independently from store sales.
3. **Official Merchandise Store**: Four core product categories (**Track Suits**, **T-Shirts/Jerseys**, **Shorts**, **Compression Sleeves**) with image galleries, size/color selectors, real-time stock counters, and one-click WhatsApp pre-filled ordering.
4. **Media Vault & YouTube Hub**: Tournament-categorized photo gallery with interactive full-screen lightbox and official YouTube broadcast stream archive.
5. **Admin Command Center**: JWT-authenticated management dashboard for managing products, categories, quotations, cameraman assignments, gallery photos, YouTube videos, customer inquiries, and brand/contact settings.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Framer Motion, Lucide React, Yet-Another-React-Lightbox, React Hot Toast, Axios |
| **Backend** | Node.js, Express.js, Mongoose 8, JWT Authentication, bcryptjs, Helmet, Morgan, Express Rate Limit, Express Validator |
| **Database** | MongoDB Atlas / Local MongoDB Mongoose Models |
| **Asset Storage** | Cloudinary integration + Local static `/uploads` disk fallback |
| **Deployment Ready**| Frontend on Vercel, Backend on Render / Node hosting, Database on MongoDB Atlas |

---

## 📁 Project Architecture

```
VMD/
├── backend/
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & adminOnly guard
│   │   └── upload.js              # Cloudinary & local disk storage fallback
│   ├── models/
│   │   ├── Booking.js             # Cameraman booking requests & audit history
│   │   ├── Category.js            # Merchandise categories
│   │   ├── Enquiry.js             # General & department contact inquiries
│   │   ├── Gallery.js             # Cricket photo gallery entries
│   │   ├── Product.js             # Store catalog with sizes, stock & colors
│   │   ├── User.js                # Admin accounts with bcrypt password hashing
│   │   ├── Video.js               # YouTube broadcasts & match highlights
│   │   └── WebsiteSettings.js     # Configurable WhatsApp, phones & brand info
│   ├── routes/
│   │   ├── auth.js                # /api/auth (login, me, change-password)
│   │   ├── bookings.js            # /api/bookings (submit, status, admin CRUD)
│   │   ├── categories.js          # /api/categories
│   │   ├── enquiries.js           # /api/enquiries
│   │   ├── gallery.js             # /api/gallery
│   │   ├── products.js            # /api/products
│   │   ├── settings.js            # /api/settings
│   │   ├── upload.js              # /api/upload
│   │   └── videos.js              # /api/videos
│   ├── utils/
│   │   └── seed.js                # Comprehensive database seed script
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Main Express API server
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, Footer, Layout wrapper
│   │   │   └── shared/            # ProtectedRoute, ScrollToTop
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Admin JWT auth session
│   │   │   └── SettingsContext.jsx# Live global website configurations
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Cinematic hero, services, merch, gallery & video hub
│   │   │   ├── MerchandisePage.jsx# Filterable catalog with stock badges
│   │   │   ├── ProductDetailPage.jsx# Gallery, size selector, WhatsApp Order Now
│   │   │   ├── BookingPage.jsx    # Cameraman booking request form
│   │   │   ├── BookingStatusPage.jsx # Reference inquiry & timeline tracker
│   │   │   ├── LiveStreamingPage.jsx # Broadcast packages & equipment showcase
│   │   │   ├── GalleryPage.jsx    # Tournament photo grid with lightbox
│   │   │   ├── YouTubePage.jsx    # YouTube hub with embedded modal player
│   │   │   ├── ServicesPage.jsx   # Detailed guide to all 6 cricket media services
│   │   │   ├── AboutPage.jsx      # Brand story, milestones & production standard
│   │   │   ├── ContactPage.jsx    # Contact form & department routing
│   │   │   ├── NotFoundPage.jsx   # 404 cricket-themed page
│   │   │   └── admin/
│   │   │       ├── AdminLogin.jsx        # Secure portal login
│   │   │       ├── AdminLayout.jsx       # Responsive admin drawer & sidebar
│   │   │       ├── AdminDashboard.jsx    # KPI metrics & recent bookings
│   │   │       ├── AdminProducts.jsx     # Products table & stock monitor
│   │   │       ├── AdminProductForm.jsx  # Add/edit product, sizes & image upload
│   │   │       ├── AdminCategories.jsx   # Categories management
│   │   │       ├── AdminBookings.jsx     # Filter bookings by workflow state
│   │   │       ├── AdminBookingDetail.jsx# Issue quotes, notes & assign cameramen
│   │   │       ├── AdminGallery.jsx      # Upload & tournament tags
│   │   │       ├── AdminVideos.jsx       # YouTube URL manager
│   │   │       ├── AdminEnquiries.jsx    # Customer inquiry reply desk
│   │   │       └── AdminSettings.jsx     # Configurable contact & WhatsApp numbers
│   │   ├── services/
│   │   │   └── api.js             # Axios client with bearer token interceptor
│   │   ├── App.jsx                # Route registry
│   │   ├── index.css              # Custom neon utility classes & sports typography
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── package.json                   # Root orchestrator
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **MongoDB** (MongoDB Atlas cluster connection string or local MongoDB)

### 1. Configure Backend Environment
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string (or local mongodb://127.0.0.1:27017/vmd_sports)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vmd_sports?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=vmd_sports_super_secure_jwt_secret_key_2026_cricket_prod
JWT_EXPIRES_IN=7d

# Default Admin Credentials
ADMIN_EMAIL=admin@vmdsports.com
ADMIN_PASSWORD=VMDAdmin@2024

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 2. Configure Frontend Environment
Create `frontend/.env` (or copy from `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SITE_NAME=VMD Sports
```

### 3. Run Backend & Frontend Locally
Open two terminal windows:

**Terminal 1 — Backend API Server:**
```bash
cd backend
npm install
npm run seed     # Seeds default admin, categories, merchandise, gallery, and settings
npm start        # Starts server on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Now open **http://localhost:5173** in your browser.

---

## 🔐 Administrative Access

The admin portal is protected via JWT token authentication and route authorization middleware.

- **Portal URL**: `http://localhost:5173/admin/login`
- **Default Email**: `admin@vmdsports.com`
- **Default Password**: `VMDAdmin@2024`

*(A one-click "Auto-Fill Admin Credentials" button is provided on the login page for rapid pairing and evaluation).*

### Admin Modules:
1. **Overview**: Total booking count, pending/review count, catalog size, low stock indicators, and recent match requests.
2. **Merchandise Products**: Add, edit, delete, manage stock matrix per size (`S`, `M`, `L`, `XL`, `XXL`), upload product photography, set sale pricing, and toggle featured products.
3. **Categories**: Create and organize store categories (`Track`, `T-Shirts`, `Shorts`, `Sleeves`).
4. **Bookings Roster**: Filter by state (`Pending`, `Under Review`, `Quotation Sent`, `Confirmed`, `Completed`, `Rejected`, `Cancelled`). Assign cameraman names, insert estimated pricing and quote breakdowns, and click to open a direct WhatsApp chat with the customer.
5. **Photo Gallery**: Organize photos by tournament and league.
6. **YouTube Broadcasts**: Add video links with automatic YouTube video ID extraction and high-res thumbnail previews.
7. **Website Settings**: Dynamically update WhatsApp ordering numbers, Live Streaming hotline numbers, brand logos, email addresses, and studio location.

---

## 📱 WhatsApp Ordering Workflow

When a user browses merchandise on `/merchandise` or `/merchandise/:slug`:
1. Customer selects size (`S`, `M`, `L`, `XL`, `XXL`).
2. Customer selects color and quantity.
3. Total price in INR is calculated live.
4. Clicking **"Order Now"** generates a pre-formatted WhatsApp enquiry message directed to the phone number configured in Admin Settings:
   ```
   Hello VMD Sports! I want to order:
   Product: VMD Pro Strike Cricket Track Suit
   Size: L
   Color: Stealth Black & Lime
   Quantity: 1
   Price: ₹1999
   Please confirm availability.
   ```
5. Extensible for cart and online payment gateways (Stripe / Razorpay) in future iterations.

---

## 🎥 Cameraman Booking Workflow

1. Customer fills the booking request form on `/book-cameraman` (Full Name, Mobile, Email, Service Type, Match Date, Ground Location, Tournament Name, Expected Duration, Special Requirements).
2. The system generates a unique reference number (e.g. `VMD-202611-0001`).
3. The booking is marked as **"Pending"** or **"Under Review"** (requests are verified manually by the VMD team, no fake automated confirmation).
4. Customer can track live status at `/booking-status?ref=VMD-YYYYMM-XXXX`.
5. The VMD admin reviews venue logistics, enters a quotation amount, assigns an equipment rig/cameraman, and updates status to **"Quotation Sent"** or **"Confirmed"**.

---

## 🌐 Production Deployment

- **Frontend (Vercel)**:
  - Framework Preset: `Vite`
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`

- **Backend (Render / Railway / VPS)**:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`
