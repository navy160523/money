# Money Management System

A full-stack application for managing finances with a premium UI.

## Features
- **Lock Screen**: Secure entryway with session-based locking.
- **Dashboard**: Monthly calendar overview with income/expense summaries (KST).
- **Transaction Management**: Full CRUD operations for income and expenses.
- **Premium UI**: Glassmorphism, smooth animations, and modern aesthetics.

## Tech Stack
- **Frontend**: Vue.js 3, Vite, Axios, Day.js
- **Backend**: Java Spring Boot
- **Database**: Firebase Firestore

## Setup Instructions

### Backend (Spring Boot)
1. Navigate to the `backend` directory.
2. Place your Firebase Service Account JSON file at `backend/src/main/resources/serviceAccountKey.json`.
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend (Vue)
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage
- The default password for the lock screen is `1234`.
- The session is cleared when the window is closed (using `sessionStorage`).
