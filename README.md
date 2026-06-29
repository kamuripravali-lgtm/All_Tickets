# TripEase - All-in-One Travel Ticket Booking Platform

**TripEase** is a comprehensive, full-stack travel booking application designed for searching, comparing, and booking **Flights, Trains, and Buses** from a single unified interface. 

This platform serves as a production-ready, feature-complete final-year project, offering realistic workflows, responsive layout design, and advanced interactive capabilities.

---

## 🌟 Key Features

### 1. Unified Search & Booking Engine
* **Multimodal Search**: Tabs for searching Flights ✈, Trains 🚆, and Buses 🚌 between major Indian cities (Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Goa).
* **Granular Filtering & Sorting**: Collapsible filter sidebar (pricing range, number of stops, departure/arrival times, travel operator/airline, and travel classes) with immediate sorting (Cheapest, Fastest, and Earliest).

### 2. Interactive Seat Selection Map
* **Flight Map**: A visual aircraft seat grid (3x3 rows) separating business/economy configurations with window/aisle designations.
* **Train Berths**: Graphical layout of standard compartments displaying lower, middle, upper, side-lower, and side-upper berths.
* **Bus Decking**: Double-decker selection (Lower/Upper deck) in a 2x2 sleeper arrangement.

### 3. Integrated Checkout & Checkout Drawer
* **Passenger Ledger**: Multi-passenger entry forms with options to auto-load passenger details from the user's saved traveler directory.
* **Coupons Promo Engine**: Promo codes validator allowing instant discount adjustments.
* **Animated Payments**: Simulated Credit Card checkout with card-rendering visual display, along with UPI QR-Code scan panels.

### 4. Booking E-Ticket Confirmation
* **SVG QR Code**: Realistic QR-code generator embedding passenger details.
* **Print Stylesheet Layout**: Native browser printing stylesheet that formats and prints *only* the ticket voucher (hiding page navigation and details).
* **Simulated notifications**: Buttons to simulate SMS and email ticket dispatches.

### 5. Multi-User Portals & Dashboards
* **User Dashboard**: Ledgers listing Upcoming, Completed, and Cancelled trips, featuring a **Live Cancellation & Refund Status Timeline Tracker**.
* **Admin Dashboard**: Visual analytics cards (Gross Revenue, Tickets Sold, Refund Rates, User Count) with interactive CRUD tables to add/edit/delete transport schedules and promo coupons.

### 6. Advanced Features
* **AI Travel Assistant**: A chatbot drawer with natural query keyword parsing (e.g., *"Find the cheapest flight from Delhi to Mumbai"* automatically updates the application search state and triggers redirection!).
* **Voice Search capability**: Integrates the native browser Speech Recognition API (`webkitSpeechRecognition`) to speak queries.
* **Smart Price Prediction**: Fluctuation graphs/warnings suggesting "Good time to book" or "Expected fare hikes".
* **Multilingual Options**: Instant UI translation between English, Hindi, Telugu, Tamil, Kannada, and Malayalam.
* **Dark Mode**: Fully styled CSS glassmorphism theme transitions.

---

## 🛠 Technology Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v3, React Router v6, Framer Motion, Lucide React
* **Backend**: Node.js, Express, JSONWebToken, BcryptJS, Mongoose, Dotenv
* **Database**: MongoDB (supporting local MongoDB or Atlas connections) OR Local JSON-file database.

---

## 💾 Architecture: Dual-Database Mode

To make this project **100% portable and runnable immediately in any environment without installing MongoDB**, the server uses a **Repository Pattern**:
1. **Local Mode (Default)**: Automatically reads and writes to a local JSON file: `server/data/db.json`.
2. **MongoDB Mode**: Easily toggled by changing `DATABASE_MODE=mongodb` and adding your connection string `MONGODB_URI` in `server/.env`. Mongoose models will seamlessly override the local models.

---

## 🚀 Setup & Launch Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)

### 1. Installation
Run the workspace script at the root directory to install all packages for the workspace, client, and server:
```bash
npm run install:all
```

### 2. Environment Configuration
Check `server/.env` to configure your PORT, JWT secret, and database mode. By default, it runs on local mode:
```env
PORT=5000
JWT_SECRET=tripease_super_secure_development_secret_key
DATABASE_MODE=local
```

### 3. Database Seeding (Done Automatically!)
On initial startup, the Express server checks if the database is empty. If it has 0 items, it automatically populates the database with over 100+ flights, trains, buses, and promo coupons.
*To manual re-seed at any time, run:*
```bash
npm run seed --prefix server
```

### 4. Running the Application
To launch the client and server concurrently in development mode, run:
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) to view the web application.

---

## 🔑 Evaluator Demo Credentials

The authentication page contains demo credentials quick-fill buttons for fast testing:
* **Standard User**: `user@tripease.com` / password: `user123`
* **Administrator**: `admin@tripease.com` / password: `admin123`
