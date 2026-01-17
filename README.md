# LiveTalk - Real-time Chat Application

A real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

## Tech Stack

*   **Frontend**: React (Vite), Socket.IO Client, Axios, React Router DOM
*   **Backend**: Node.js, Express, Socket.IO, MongoDB (Mongoose)

## Prerequisites

*   Node.js (v14+ recommended)
*   MongoDB (Local installation or Atlas URI)

## Setup & Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd LiveTalk
```

### 2. Backend Setup
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/livetalk  # or your MongoDB Atlas URI
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Frontend Setup
Navigate to the `frontend` folder and install dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

You need to run both the backend and frontend servers concurrently.

### 1. Start the Backend
In the `backend` terminal:
```bash
npm run dev
# OR
npm start
```
The server will run on `http://localhost:5000`.

### 2. Start the Frontend
In the `frontend` terminal:
```bash
npm run dev
```
The application will run on `http://localhost:5173`.

## Features
- Real-time messaging
- User authentication
- File sharing
