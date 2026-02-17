# VoteChain - Secure Online Voting Platform

## 🚀 Getting Started

### 1. Admin Access
An admin account has been automatically created for you.
- **Email:** `admin@votechain.com`
- **Password:** `admin123`

Login at `/login` with these credentials to access the **Admin Dashboard**.

### 2. Admin Dashboard Features
Once logged in as an Admin, navigate to `/admin/dashboard` to:
- **Create Elections:** Set title, description, and voting window.
- **Manage Candidates:** Add candidates with photos and manifestos to specific elections.
- **View Results:** See real-time status and decrypted results for closed elections.

### 3. Voter Access
- Users can register at `/register`.
- Once logged in, they can view active elections at `/elections`.
- Voting is secure and encrypted.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS v4, Framer Motion
- **Backend:** Node.js, Express, Sequelize (SQLite/Postgres)
- **Security:** RSA Encryption for votes, JWT Authentication, Immutable Audit Log

## 🎨 Design
The application features a premium "Glassmorphism" design with:
- Smooth page transitions
- Interactive hover effects
- Responsive charts for results
- Loading skeletons and spinners
