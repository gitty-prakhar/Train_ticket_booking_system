# 🚄 IRCTC Next-Gen: Highly Scalable Train Booking System

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)

A fully functional, highly scalable, and deliberately "over-engineered" clone of the IRCTC Train Ticket Booking system. Built to handle massive concurrent traffic (like Tatkal booking scenarios), eliminate race conditions, and process async tasks reliably.

## 🔥 Key System Architecture & Features

This isn't just a basic CRUD app. This project tackles real-world distributed systems problems:

### 1. Distributed Seat Locking (Race Condition Prevention)
During Tatkal booking, 10,000 users might try to book the exact same 10 seats simultaneously. If not handled correctly, this leads to double-booking. 
- **Solution:** Integrated **Upstash Redis** to implement a distributed mutex lock on individual seats. When a user selects a seat, it is locked in Redis for 5 minutes. No other user or process can touch that seat until the lock expires or the ticket is paid for.

### 2. BullMQ Background Workers (Async Queues)
Sending emails synchronously during a request blocks the Node.js event loop, making the API painfully slow.
- **Solution:** Implemented **BullMQ** on top of Redis to handle background jobs. When a ticket is confirmed, an event is pushed to the `emailQueue`. A separate background worker picks up the job and sends the E-Ticket via Nodemailer. If it fails, BullMQ automatically retries the job.

### 3. Automated Smart Waitlist Engine
When a confirmed passenger cancels their ticket, the system needs to automatically upgrade the first waitlisted passenger.
- **Solution:** A secondary BullMQ `waitlistQueue` listens for cancellation events, processes the waitlist FIFO queue, upgrades the passenger, and fires off an automated confirmation email.

### 4. Graph Traversal for Connecting Trains
If no direct train exists between two stations, the system automatically finds a 1-stop connecting route.
- **Solution:** Custom graph traversal algorithm that scans train schedules, checks directional integrity, ensures layover times are valid (between 1 hour and 12 hours), and combines fare calculations across multiple train legs.

### 5. Enterprise Payment Integration
Integrated **Razorpay** with secure server-side order generation and cryptographic signature verification to ensure tickets are only marked as "Paid" when the webhook/callback signature matches the `HMAC SHA256` secret hash.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, React Router DOM, Lucide Icons, Vanilla CSS
- **Backend:** Node.js, Express.js v5, Mongoose
- **Database:** MongoDB Atlas
- **Cache / Message Broker:** Redis (Upstash)
- **Queues:** BullMQ
- **Payments:** Razorpay
- **Authentication:** JWT (HttpOnly Cookies, Access/Refresh Token architecture)

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB connection URI
- Upstash Redis URI
- Razorpay Test Keys
- Gmail App Password (for Nodemailer)

### 1. Clone the Repository
```bash
git clone https://github.com/gitty-prakhar/Train_ticket_booking_system.git
cd Train_ticket_booking_system
```

### 2. Setup Backend Environment Variables
Create a `.env` file in the `/backend` directory:
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
REDIS_URL=your_upstash_redis_url
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Backend
```bash
cd backend
npm install
npm start
```
*Note: `npm start` will spin up the main Express API as well as the Email and Waitlist BullMQ background workers.*

### 4. Setup Frontend Environment Variables
Create a `.env` file in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Live Deployment URLs
- **Frontend (Vercel):** [Live Site](https://train-ticket-booking-system-peach.vercel.app/)
- **Backend API (Render):** [Live API](https://train-ticket-booking-system-dflb.onrender.com)
- **API Documentation (Swagger):** [Swagger Docs](https://train-ticket-booking-system-dflb.onrender.com/api-docs)

---

### Author
Built with a passion for backend systems architecture. If you find this useful or have any feedback, feel free to open an issue or pull request!
