# RSV — Modern Video Streaming Platform

RSV is a high-performance, responsive, YouTube-inspired video streaming platform built with a Node.js/Express/MongoDB backend and a modern Vanilla JS/CSS frontend.

## 🚀 Key Features

- **Responsive Design**: Fully fluid layout for Desktop, Tablet, and Mobile.
- **Video Grid**: Dynamic grid with category filtering and infinite search.
- **Watch Page**: Interactive player with related video recommendations.
- **Authentication**: JWT-based user registration and login system with secure password hashing.
- **Full-Text Search**: Optimized searches using MongoDB text indexes.
- **Modern UI**: Dark mode aesthetic with glassmorphism accents and smooth transitions.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JWT, Bcryptjs, Helmet, Express-Rate-Limit.

## 📦 Project Structure

```text
.
├── Backend/              # Express API & Server logic
├── Frontend/             # Assets, global CSS, and JS logic
├── pages/                # Sub-pages (Watch, Login, etc.)
├── index.html            # Application entry point
├── .gitignore            # Git exclusion rules
└── README.md             # This file
```

## 🚥 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) (running locally or on Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd RSV
   ```

2. Setup Backend:
   ```bash
   cd Backend
   npm install
   cp .env.example .env  # Update with your MongoDB URI and Secrets
   ```

3. Setup Frontend (Optional for dev sync):
   ```bash
   cd ../Frontend
   npm install
   ```

### Running the Application

1. Start the Backend server:
   ```bash
   cd Backend
   npm run dev
   ```

2. Seed Sample Data (Optional):
   ```bash
   cd Backend
   node utils/seedVideos.js
   ```

3. Access the Platform:
   Open **http://localhost:5000** in your browser. (The backend automatically serves the frontend static files).

## 📄 License

This project is licensed under the ISC License.
