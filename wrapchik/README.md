# 🌯 WRAPCHIK — Full-Stack Campus Food Ordering & Shop Management Application

Wrapchik is a production-ready MVP designed for a college campus food outlet. It replaces slow, manual WhatsApp menu ordering with a fast, digital ordering platform for students and an intuitive, real-time shop management dashboard for shopkeepers.

---

## 📌 Problem Statement
At campus food outlets like **Wrapchik**, students currently have to manually check WhatsApp catalogs, send manual messages, wait in long counter queues, and handle cash transactions manually.

This causes:
- Slow ordering and long counter queues
- Inconvenient menu browsing & lack of search/filter capabilities
- Absence of cart management and dynamic price customization
- Lack of order tracking & pickup notifications
- Manual and error-prone order management for shopkeepers
- No centralized order history or revenue reporting
- Communication friction regarding item availability

---

## 💡 Solution
Wrapchik provides a unified digital ordering platform:

### 🎓 Student Flow:
`Open App ➔ Register/Login ➔ Browse Menu ➔ Search/Filter ➔ View Product & Customize ➔ Add to Cart ➔ Checkout ➔ Online Payment (Razorpay) ➔ Order Confirmation ➔ Live Order Tracker ➔ Pickup Order`

### 👨‍🍳 Shopkeeper/Admin Flow:
`Admin Login ➔ Dashboard ➔ Receive Live Order ➔ Accept/Reject ➔ Start Preparing ➔ Mark Ready for Pickup ➔ Complete Order ➔ Manage Inventory & Toggle Availability ➔ View Sales Analytics`

---

## 🔥 Features

### Student App Features:
- **Branded Splash & Onboarding**: Smooth welcome intro with tagline *"Fresh. Fast. Flavorful."*
- **Authentication**: JWT-based login/signup with bcrypt password hashing.
- **Dynamic Home & Search**: Real-time menu search, category filtering, and Veg/Non-Veg toggles.
- **Product Customization**: Dynamic price recalculation for add-ons (extra cheese, sauces).
- **Persistent Cart Management**: Quantity adjustment, item removal, and subtotal/GST breakdown.
- **Razorpay Online Payments**: Secure UPI, Card, NetBanking, and Wallet support with backend HMAC signature verification.
- **Live Visual Order Tracker**: Stepper timeline (`PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`).
- **Order History & Favourites**: Past order receipts and quick re-order support.

### Admin/Shopkeeper Features:
- **Real-Time Order Desk**: Instant notification of new orders with Accept & Reject controls.
- **Order State Machine**: Enforces valid status transitions to prevent accidental state changes.
- **Live Inventory Manager**: Quick `Available ON/OFF` switch to instantly hide out-of-stock items from students.
- **Product & Category CRUD**: Full creation, pricing update, description editing, and deletion.
- **Revenue Analytics**: Live dashboard reporting today's revenue, order volume, and pending counts.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Mobile Frontend** | React Native, Expo Router, React Hooks, Context API |
| **Backend REST API** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Payment Gateway** | Razorpay SDK & Web Integration |
| **Image Storage** | Cloudinary |
| **Push Notifications** | Expo Notifications |

---

## 📐 System Architecture

```text
                  STUDENT APP                               ADMIN INTERFACE
            React Native + Expo Router                   Admin Dashboard
                         │                                     │
                         └─────────────────┬───────────────────┘
                                           │ REST API (HTTPS/JSON)
                                           ▼
                                    BACKEND REST API
                                  Node.js + Express.js
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
       MongoDB Atlas                   Razorpay                     Cloudinary
     Database (Mongoose)            Online Payments                 Image Storage
```

---

## 🗄 Database Schema (Mongoose)

- `User`: `_id`, `name`, `email`, `phone`, `passwordHash`, `role` (`student`/`admin`), `favourites`
- `Category`: `_id`, `name`, `imageUrl`, `displayOrder`
- `Product`: `_id`, `name`, `description`, `price`, `categoryId`, `imageUrl`, `isVeg`, `available`, `customizations`
- `Order`: `_id`, `userId`, `orderNumber`, `items` (snapshot of name, price, quantity, customizations), `subtotal`, `taxAndFees`, `totalAmount`, `paymentStatus`, `orderStatus`
- `Payment`: `_id`, `orderId`, `userId`, `gatewayOrderId`, `gatewayPaymentId`, `gatewaySignature`, `amount`, `status`

---

## 📡 REST API Documentation

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/register`: Register student or admin account
- `POST /api/auth/login`: Authenticate credentials & return JWT
- `GET /api/auth/me`: Get current user profile

### Product Endpoints (`/api/products`)
- `GET /api/products`: Get products (`?search=`, `?category=`, `?veg=true`, `?available=true`)
- `GET /api/products/:id`: Get product details
- `POST /api/products`: [Admin] Create product
- `PUT /api/products/:id`: [Admin] Update product
- `PATCH /api/products/:id/availability`: [Admin] Quick toggle availability ON/OFF
- `DELETE /api/products/:id`: [Admin] Delete product

### Order Endpoints (`/api/orders`)
- `POST /api/orders`: Validate prices server-side & create pending order
- `GET /api/orders/my`: Get student's order history
- `GET /api/orders/:id`: Get order details & tracking status
- `POST /api/orders/:id/cancel`: Cancel order if status is `PLACED`

### Payment Endpoints (`/api/payment`)
- `POST /api/payment/create`: Generate Razorpay Order ID
- `POST /api/payment/verify`: Verify Razorpay signature & confirm order

### Admin Endpoints (`/api/admin`)
- `GET /api/admin/orders`: Fetch all orders with status filter
- `PUT /api/admin/orders/:id/status`: Update order state in state machine
- `GET /api/admin/analytics`: Get revenue and order analytics

---

## 🚀 How to Run the Application

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on mobile or Android/iOS Emulator
- MongoDB instance (Local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server will start on `http://localhost:5000` and auto-seed initial campus menu items.

### 2. Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

---

## 🔑 Environment Variables

Create `.env` in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/wrapchik
JWT_SECRET=wrapchik_super_secret_jwt_key_2026
JWT_EXPIRE=30d

# Razorpay Test Credentials
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=wrapchik_cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=wrapchik_cloudinary_secret_key
```

---

## 🧪 Quick Demo Credentials
- Demo accounts are disabled by default. Enable them only in development with the environment variables described in `README_SECURITY_PAYMENT.md`.

---

## 👥 Team Members
Developed for campus food outlet digital transformation learning & deployment.
