# Ride App Backend

This is the backend for the Ride App, built using Node.js, Express, and MongoDB. It provides APIs for user registration and authentication.

## Table of Contents

* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [API Documentation](#api-documentation)

  * [User Routes](#user-routes)

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm run start
   ```

---

## Environment Variables

Create a `.env` file in the `backend/` directory and configure the following variables:

```env
PORT=8002
MONGO_URI="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
```

---

## API Documentation

### Base URL

```
http://localhost:<PORT>/api/v1
```

---

## `/user/register` Endpoint

### Description

Registers a new user by creating a user account with the provided information.

### HTTP Method

`POST`

### Request Body

The request body should be in JSON format and include the following fields:

* `fullname` (object):

  * `firstname` (string, required): User's first name (minimum 3 characters).
  * `lastname` (string, optional): User's last name (minimum 3 characters if provided).
* `email` (string, required): User's email address (must be a valid email).
* `password` (string, required): User's password (minimum 6 characters).

### Example Request

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Example Successful Response (`201`)

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com"
    },
    "token": "jwt_token"
  }
}
```

## `/user/login` Endpoint

### Description

Authenticates a user using their email and password, and returns a JWT token along with full user data **(including the password)** as currently implemented.

---

### HTTP Method

`POST`

---

### Request Body

The request body should be in JSON format and include the following fields:

* `email` (string, required): User's registered email address.
* `password` (string, required): User's account password.

---

### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

---

### Successful Response (`200`)

Returns the user object (currently including the hashed password) and a JWT token.

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com",
      "password": "$2a$10$hashedPasswordHere"
    },
    "token": "jwt_token"
  }
}
```

---

### Error Responses

#### `401 Unauthorized`

* **User does not exist**

```json
{
  "success": false,
  "message": "Failed to login user",
  "error": "User does not exist",
  "data": {}
}
```

* **Incorrect password**

```json
{
  "success": false,
  "message": "Failed to login user",
  "error": "Invalid email or password",
  "data": {}
}
```

## `/user/profile` Endpoint

### Description

Retrieves the authenticated user's profile information.

---

### HTTP Method

`GET`

---

### Authentication

Requires a valid JWT token, provided either as:

* **HTTP-only cookie** (`token`)
  **or**
* **Authorization header**: `Bearer <token>`

---

### Example Request

```http
GET /api/v1/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Successful Response (`200`)

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
    // ...other fields
  }
}
```

---

### Error Responses

#### `401 Unauthorized`

```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### `404 Not Found`

```json
{
  "success": false,
  "message": "User not found"
}
```

#### `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to retrieve user profile",
  "error": "Error details"
}
```

---

## `/user/logout` Endpoint

### Description

Logs out the user by blacklisting the provided JWT token and clearing cookie Prevents future use of the same token.

---

### HTTP Method

`POST`

---

### Authentication

Requires a valid JWT token, provided as:

* **Authorization header**: `Bearer <token>`

---

### Example Request

```http
POST /api/v1/user/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Successful Response (`200`)

```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

### Error Responses

#### `401 Unauthorized`

```json
{
  "success": false,
  "message": "Token missing or invalid"
}
```

#### `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to logout user",
  "error": "Error details"
}
```

