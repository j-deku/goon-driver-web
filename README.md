<div align="center">

# 🚖 GoOn Driver Web Frontend

### A production-grade Ride Hailing Web System built with ReactJS · Vite · Socket.io

[![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![Symfony](https://img.shields.io/badge/Symfony-8.4-black?style=for-the-badge&logo=symfony&logoColor=white)](https://symfony.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Symfony Mercure](https://img.shields.io/badge/Symfony%20Mercure-Realtime-black?style=for-the-badge&logo=symfony&logoColor=white)](https://symfony.com/doc/current/mercure.html)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

</div>

---

## Overview

**GoOn Driver Web** is a fully functional backend system for an Uber-like ride-hailing system. It handles the complete ride lifecycle — from rider requesting a ride to driver accepting, starting, completing, and rating — backed by real geospatial queries, JWT-based authentication, strategy-pattern business logic, and a wallet payment system.

The project is designed following **clean architecture principles**: thin controllers, interface-driven service layer, repository abstraction, and separate strategy classes for pluggable business rules.

---

## ✨ Core Features

### Authentication & Security

- Role-based access control — `ROLE_ADMIN`, `ROLE_DRIVER`, `ROLE_RIDER`
- Spring Security filter chain with a custom `JwtAuthFilter`
- Token refresh endpoint reads refresh token from cookie (never exposed in response body)

### Fare Calculation (Strategy Pattern)

- `RideFareCalculationStrategy` interface with two implementations:
  - **Default Fare** — base rate × road distance
  - **Surge Pricing** — base rate × road distance × **2x surge multiplier**
- `RideStrategyManager` selects the correct strategy at runtime based on demand

### Payment System (Strategy Pattern)

- `PaymentStrategy` interface with two implementations:
  - **Cash Payment** — marks payment confirmed, adds fare to driver wallet
  - **Wallet Payment** — debits rider wallet, credits driver wallet, logs transactions
- `PaymentStrategyManager` resolves strategy from `PaymentMethod` enum at runtime

### 🚗 Ride Lifecycle Management

- Full state machine: `PENDING → CONFIRMED → ONGOING → ENDED / CANCELLED`
- OTP-verified ride start (driver submits OTP, rider receives it on booking)
- Atomic `@Transactional` operations across ride, payment, and driver availability
- Paginated ride history for both rider and driver (sorted by `createdTime DESC`)

### ⭐ Ratings System

- Rider rates driver; driver rates rider — both stored per ride
- Average rating auto-computed and persisted on `Driver` and `Rider` entities

### Wallet & Transactions

- Each user has a `Wallet` with balance tracking
- `WalletTransaction` records every debit/credit with `TransactionType` and `TransactionMethod`
- Wallet created automatically on user signup

---

## Tech Stack

| Layer     | Technology                    |
| --------- | ----------------------------- |
| Language  | ReactJS + Javascript Compiler |
| Framework | Vite + React Compiler         |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Web App                │
└────────────────────────┬────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────┐
│                 Login / Registration
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│   Login Process         │  Email Verification
└──────────┬──────────────────────────┬───────────────┘
           │                          │
┌──────────▼──────────┐  ┌────────────▼──────────────┐
│   Login success     │  │    Verification success   │
│  RideService        │  │  Authentication succeed   │
└──────────┬──────────┘  |___________________________|
           │
┌──────────▼──────────────────────────────────────────┐
│              USER ACCOUNT / PROFILE MANAGEMENTS
└──────────┬──────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
goon-driver-web/
├── src/components/
│   ├── Header/
│   │   ├── Header.jsx                # Error response model
│   ├── Navbar/                # Header section of the page
│   │   ├── Navbar.jsx
│   │   └── Navbar.css     # Navbar section of the customer page
│   │── Header/
│   ├── configs/
│   │   ├──
│   │   ├──
│   │   └──          # HTTP security rules
│   │
│   ├── utils/
│   │   ├── PublicRoute.jsx           # Public Routes protection
│   │   ├── PrivateRoute.jsx          # Private Routes protection
│   │
│   │
│   ├── /
│   ├── pages/                           # JPA Entities
│   │   ├── Home/                          # RideStatus, PaymentMethod, Role ...
│   │   ├── Settings
│   │   ├── Dashboard                   # Geometry(Point,4326) fields
│   │   ├── SearchRide
│   │   ├── Verify-otp                 # Verify OTP page
│   │   ├── RegisForm                  # Registration page
│   │   ├── Verify                     # Payment verification page
│   │   ├── CreateRide
│   │   ├── Login                      # Login driver page
│   │   └── Forgot Password page, etc
│   │
│   ├── exceptions/
│   │   ├──
│   │   └──
│   │
│   │
│   ├── guards/
│   │   ├── adminGuard
│   │
│   │
│   ├── Hooks/                           # Service implementations
│   │       ├── DistanceServiceOSRMImpl.java # OSRM road distance API
│   │       ├── DriverServiceImpl.java
│   │       ├── RiderServiceImpl.java
│   │       ├── RideServiceImpl.java
│   │       ├── PaymentServiceImpl.java
│   │       ├── WalletServiceImpl.java
│   │       ├── RatingServiceImpl.java
│   │       └── EmailSenderServiceImpl.java
│   │
│   │
│
│
│
├── src/main/resources/
│   └── data.js                           # Seed data
│
├── goon-driver.postman_collection.json         # Ready-to-import Postman collection
```

---

### Prerequisites

- Vite + reactJS + React Compiler

### 1. Clone the Repository

```bash
git clone https://github.com/AppDefine/goon-driver-web.git
cd goon-driver-web
```

# VITE Config

VITE_PORT=5173
VITE_API_BASE_URL=

````

### 2. Build & Run

```bash
# Build
npm run build

# Run
npm run dev
````

The server starts at `http://localhost:5173`

---

## Authentication Flow

```
POST /Oauth/signup         →  Create account
POST /Oauth/login          →  Get access token (+ refresh token in HttpOnly cookie)
                             Add header: Authorization: Bearer <access_token>
GET  /Oauth/refresh        →  Renew access token using cookie (no body needed)
```

---

## Design Patterns Used

| Pattern               | Where Applied                                                                 |
| --------------------- | ----------------------------------------------------------------------------- |
| **Strategy**          | Driver matching (Nearest / Highest Rated)                                     |
| **Strategy**          | Fare calculation (Default / Surge Pricing)                                    |
| **Strategy**          | Payment processing (Cash / Wallet)                                            |
| **Factory / Manager** | `RideStrategyManager`, `PaymentStrategyManager` resolve strategies at runtime |

---

## Testing

```bash
npm run build
```

A Postman collection with pre-configured requests for all endpoints is included:

```
GoOn-driver-web.postman_collection.json
```

Import it into Postman and set the `base_url` variable to `http://localhost:5173`.

---

## Security Highlights

- Passwords never stored in plain text — BCrypt hashing via GoOn backend Security
- JWT signed with HMAC-SHA256; validated on every request via `JwtAuthFilter`
- Refresh token stored in **HttpOnly cookie** — inaccessible to JavaScript (XSS protection)
- Role-based endpoint guards using `@Secured` annotations
- Input validation with `@Valid` + field-level error messages in response

---

## Key Dependencies

```xml
npm run dev
npm run prod
npm run build
```

---

## Planned Enhancements

- [ ] Google Maps / HERE Maps integration for live routing
- [ ] WebSocket — real-time ride status updates
- [ ] OTP delivery via SMS (Twilio)
- [ ] Push notifications (Firebase FCM)
- [ ] User/customer dashboard
- [ ] Ride fare estimation before booking
- [ ] Docker + Docker Compose setup
- [ ] CI/CD pipeline (GitHub Actions)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

<div align="center">

Made with ❤️ using **ReactJs · Vite · Socket.io · Node**

</div>
