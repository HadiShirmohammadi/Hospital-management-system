# Hospital Management System — Backend (Spring Boot + PostgreSQL + JWT)

A REST API backend for a hospital appointment system, built with Spring Boot, Spring Data JPA, PostgreSQL, and JWT-based authentication. Designed to work as a drop-in backend replacement for a matching React frontend (originally built with Node/Express + MySQL), reimplemented here in Java.

## Features

- User registration & login with hashed passwords (BCrypt)
- Stateless authentication using JSON Web Tokens (JWT)
- Role-based authorization (regular users vs. admins)
- Admins can create and delete appointments
- Any user can browse available appointments
- Authenticated users can reserve / un-reserve appointments
- PostgreSQL database via Spring Data JPA (Hibernate)
- Clean layered architecture: Controller → Service → Repository

## Tech Stack

**Backend**
- Java 21
- Spring Boot 4.1.0
- Spring Web (MVC)
- Spring Data JPA / Hibernate
- Spring Security
- PostgreSQL
- JJWT (`io.jsonwebtoken`) 0.11.5 — JWT creation & validation
- BCrypt — password hashing

## Project Structure

```
src/main/java/com/Hospital/backend/
├── BackendApplication.java
├── Config/
│   ├── SecurityConfig.java            # Spring Security filter chain & route rules
│   └── JwtAuthenticationFilter.java   # Reads & validates JWT on every request
├── Controller/
│   ├── UserController.java            # /auth/*  endpoints
│   └── AppointmentController.java     # /hospital/* endpoints
├── Dto/
│   ├── AuthResponse.java              # Returned after register/login (token + basic info)
│   ├── UserProfileResponse.java       # Returned by /auth/check (profile + appointments)
│   └── AppointmentSummary.java        # Safe, flattened appointment data (optionally includes reservedByUsername)
├── Entities/
│   ├── User.java
│   └── Appointment.java
├── Repository/
│   ├── UserRepository.java
│   └── AppointmentRepository.java
└── Service/
    ├── JwtService.java                # generateToken / extractUsername / extractIsAdmin / isTokenValid
    ├── UserService.java
    └── AppointmentService.java
```

## How Authentication Works

1. A user registers or logs in via `/auth/register` or `/auth/login`.
2. On success, the server generates a signed JWT (HMAC-SHA256) containing the username (`subject`) and an `isAdmin` claim, valid for 12 hours.
3. The client stores the token and sends it on every subsequent request using the header:
   ```
   Authorization: Bearer <token>
   ```
4. `JwtAuthenticationFilter` intercepts each incoming request, validates the token, and — if valid — populates Spring Security's `SecurityContext` with the user's identity and role(s) (`ROLE_USER`, and `ROLE_ADMIN` if applicable).
5. `SecurityConfig` enforces which routes require authentication and which require the `ADMIN` role.

JWTs are **signed, not encrypted** — the payload is readable by anyone who has the token, but cannot be modified without invalidating the signature. No sensitive data (e.g. passwords) is ever placed inside the token.

## Getting Started

### Clone the repository

```
git clone <your-repo-url>
cd <project-folder>
```

### Database setup

Create a PostgreSQL database:

```sql
CREATE DATABASE hospital_db;
```

Tables are created automatically on startup via `spring.jpa.hibernate.ddl-auto=update`, based on the JPA entities (`User`, `Appointment`) — no manual `CREATE TABLE` statements are required.

### Configure environment variables

This project reads sensitive values from environment variables rather than hardcoding them. Set the following before running the app:

| Variable      | Description                                   |
|---------------|------------------------------------------------|
| `JWT_SECRET`  | Secret key used to sign JWTs (min. 32 chars)  |
| `DB_PASSWORD` | PostgreSQL password for the configured user   |

`src/main/resources/application.properties`:

```properties
spring.application.name=backend
spring.datasource.url=jdbc:postgresql://localhost:5432/hospital_db
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
jwt.secret=${JWT_SECRET}
```

### Run the backend

```
./mvnw spring-boot:run
```

The backend will run on:

```
http://localhost:8080
```

CORS is currently configured (via `@CrossOrigin`) to accept requests from:

```
http://localhost:5173
```

Update this in `UserController` and `AppointmentController` if your frontend runs on a different origin.

## API Reference

### Auth Endpoints (`/auth`)

#### Register a new user
```
POST /auth/register
```
Request body:
```json
{
  "firstname": "Abolfazl",
  "lastname": "Doe",
  "username": "Abolfazl",
  "email": "abolfazl@example.com",
  "number": "1234567890",
  "password": "AbolfazlsPassword"
}
```
Response `200 OK`:
```json
{
  "token": "<jwt-token>",
  "username": "Abolfazl",
  "admin": false
}
```

#### Log in
```
POST /auth/login
```
Request body:
```json
{
  "username": "Abolfazl",
  "password": "AbolfazlsPassword"
}
```
Response `200 OK`: same shape as `/auth/register`.
Response `401 Unauthorized` if credentials are invalid.

#### Get current user profile (+ reserved appointments)
```
GET /auth/check
```
Requires header: `Authorization: Bearer <token>`

Response `200 OK`:
```json
{
  "username": "Abolfazl",
  "firstname": "Abolfazl",
  "lastname": "Doe",
  "email": "abolfazl@example.com",
  "number": "1234567890",
  "admin": false,
  "appointments": [
    {
      "id": 1,
      "doctor": "Dr. Smith",
      "title": "General Checkup",
      "place": "Room 204",
      "date": "2026-07-01",
      "time": "10:00"
    }
  ]
}
```
Response `404 Not Found` if the authenticated user no longer exists.

#### Check admin status
```
GET /auth/admin
```
Requires header: `Authorization: Bearer <token>`
- `200 OK` if the user is an admin
- `403 Forbidden` otherwise

### Hospital / Appointment Endpoints (`/hospital`)

All endpoints below except `GET /hospital/appointments` require a valid JWT in the `Authorization` header. `POST /hospital/add`, `DELETE /hospital/delete/{id}`, and `GET /hospital/admin/appointment` additionally require the `ADMIN` role.

#### Get all appointments (public)
```
GET /hospital/appointments
```

#### Add a new appointment (admin only)
```
POST /hospital/add
```
Request body:
```json
{
  "doctor": "Dr. Smith",
  "title": "General Checkup",
  "place": "Room 204",
  "date": "2026-07-01",
  "time": "10:00"
}
```

#### Reserve an appointment
```
POST /hospital/reserve/{appointmentId}
```
Requires header: `Authorization: Bearer <token>`

The reserving user is identified from the JWT (`Authentication`), **not** from a client-supplied ID — this prevents a user from reserving an appointment on someone else's behalf.

Response `200 OK`:
```json
{
  "id": 1,
  "doctor": "Dr. Smith",
  "title": "General Checkup",
  "place": "Room 204",
  "date": "2026-07-01",
  "time": "10:00"
}
```
Response `400 Bad Request` if the appointment is already reserved or doesn't exist.
Response `404 Not Found` if the authenticated user no longer exists.

#### Un-reserve an appointment
```
POST /hospital/unreserve/{appointmentId}
```
Requires header: `Authorization: Bearer <token>`

#### Delete an appointment (admin only)
```
DELETE /hospital/delete/{id}
```

#### Get all appointments with the reserving user's username (admin only)
```
GET /hospital/admin/appointment
```
Requires header: `Authorization: Bearer <token>` with the `ADMIN` role.

Returns only appointments that have been reserved, including who reserved each one:
```json
[
  {
    "id": 1,
    "doctor": "Dr. Smith",
    "title": "General Checkup",
    "place": "Room 204",
    "date": "2026-07-01",
    "time": "10:00",
    "reservedByUsername": "Abolfazl"
  }
]
```

## Learning Goals

This backend was built as a Java/Spring re-implementation of a JavaScript (Node/Express + MySQL) hospital appointment app, to practice:

- REST API design with Spring MVC
- Spring Data JPA & PostgreSQL
- Stateless JWT authentication & role-based authorization with Spring Security
- Layered architecture (Controller / Service / Repository / DTO)
- Safe API responses via DTOs (avoiding entity leakage)
