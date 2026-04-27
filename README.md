# Secure Online Voting Platform

A highly secure, tamper-evident online voting system designed specifically for academic institutions. This platform ensures voter anonymity, cryptographic vote secrecy, and an immutable audit trail using blockchain-style hash chaining.

## 🚀 Key Features

*   **End-to-End Encryption (E2EE):** All votes are encrypted client-side using RSA-2048 asymmetric encryption. The backend stores ciphertexts, preventing database administrators from viewing live vote tallies or tying votes to specific users.
*   **Immutable Blockchain Audit Log:** Every critical action (voting, viewing results, etc.) is logged with a SHA-256 hash linked to the previous transaction's hash. Any manual modification of the database instantly fractures the chain.
*   **Tamper Detection Engine:** An automated integrity verification system cross-references the physical database rows with the cryptographic ledger to detect unauthorized insertions, deletions, or modifications.
*   **Academic Domain Restriction:** Registration is strictly restricted to valid academic domains (e.g., `@iiita.ac.in`), preventing external interference.
*   **Email OTP Verification:** Validates user identities by dispatching secure One-Time Passwords via email upon registration.
*   **Multi-Factor Authentication (MFA):** Supports Time-based One-Time Password (TOTP) integration for enhanced admin and voter security.

## 🛠️ Tech Stack

*   **Frontend:** React, Tailwind CSS (Custom sleek glassmorphism theme), Framer Motion, React Router DOM, Vite.
*   **Backend:** Node.js, Express.js.
*   **Database:** PostgreSQL with Sequelize ORM.
*   **Security & Cryptography:** `bcrypt`, `jsonwebtoken` (JWT), `crypto` (RSA/SHA), `node-forge` (Client-side encryption), `nodemailer`.

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v16+)
*   PostgreSQL installed and running

### 1. Database Setup
Create a PostgreSQL database for the application.

### 2. Backend Configuration
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=8000
JWT_SECRET=your_super_secret_jwt_key

DB_NAME=secure_voting
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost

# Email configuration for OTP verification
ALLOWED_EMAIL_DOMAIN=@iiita.ac.in
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

Start the backend server (this will automatically sync the database):
```bash
npm run dev
```

### 3. Frontend Configuration
Open a new terminal, navigate to the `client` directory, and install dependencies:
```bash
cd client
npm install
```

Start the Vite development server:
```bash
npm run dev
```

## 🔐 Default Admin Account
Upon initial setup, the system is seeded with a master administrator account. You should use this to configure your first election, and then change the password immediately in the profile settings.

*   **Email:** `admin@iiita.ac.in`
*   **Password:** `admin123`

## 🛡️ Architecture Overview

1.  **Anonymity:** The `votes` table does not record timestamps (`createdAt`/`updatedAt`) or sequential IDs. It uses random UUIDs. This mathematically decouples the encrypted vote from the `audit_logs` timestamp, preventing timing correlation attacks.
2.  **Concurrency Locking:** The hash-chaining engine uses PostgreSQL Exclusive Table Locks during logging to serialize transactions, preventing race conditions during high-traffic voting periods.
3.  **Result Tallying:** Votes remain mathematically unsolvable until an election officially closes. Once closed, the backend utilizes the election's unique private key to decrypt the ciphertexts and calculate the final tally.
