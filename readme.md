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


