## `/captain/register` Endpoint

### Description

Registers a new captain by creating a captain account with the provided information and vehicle details.

### HTTP Method

`POST`

### Request Body

The request body should be in JSON format and include the following fields:

* `fullname` (object):
  * `firstname` (string, required): Captain's first name (minimum 3 characters).
  * `lastname` (string, optional): Captain's last name (minimum 3 characters if provided).
* `email` (string, required): Captain's email address (must be a valid email).
* `password` (string, required): Captain's password (minimum 6 characters).
* `vehicle` (object, required):
  * `color` (string, required): Vehicle color (minimum 3 characters).
  * `plate` (string, required): Vehicle plate (minimum 3 characters).
  * `capacity` (integer, required): Vehicle capacity (minimum 1).
  * `vehicleType` (string, required): One of `car`, `bike`, or `auto`.

### Example Request

```json
{
  "fullname": {
    "firstname": "Alice",
    "lastname": "Smith"
  },
  "email": "alice.smith@example.com",
  "password": "password123",
  "vehicle": {
    "color": "Red",
    "plate": "XYZ123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

### Example Successful Response (`201`)

```json
{
  "success": true,
  "message": "Captain registered successfully",
  "data": {
    "captain": {
      "_id": "captain_id",
      "fullname": {
        "firstname": "Alice",
        "lastname": "Smith"
      },
      "email": "alice.smith@example.com",
      "vehicle": {
        "color": "Red",
        "plate": "XYZ123",
        "capacity": 4,
        "vehicleType": "car"
      }
    },
    "token": "jwt_token"
  }
}
```

---

## `/captain/login` Endpoint

### Description

Authenticates a captain using their email and password, and returns a JWT token along with full captain data.

---

### HTTP Method

`POST`

---

### Request Body

The request body should be in JSON format and include the following fields:

* `email` (string, required): Captain's registered email address.
* `password` (string, required): Captain's account password.

---

### Example Request

```json
{
  "email": "alice.smith@example.com",
  "password": "password123"
}
```

---

### Successful Response (`200`)

Returns the captain object and a JWT token.

```json
{
  "success": true,
  "message": "Captain logged in successfully",
  "data": {
    "captain": {
      "_id": "captain_id",
      "fullname": {
        "firstname": "Alice",
        "lastname": "Smith"
      },
      "email": "alice.smith@example.com",
      "vehicle": {
        "color": "Red",
        "plate": "XYZ123",
        "capacity": 4,
        "vehicleType": "car"
      }
    },
    "token": "jwt_token"
  }
}
```

---

### Error Responses

#### `401 Unauthorized`

* **Captain does not exist**

```json
{
  "success": false,
  "message": "Failed to login captain",
  "error": "Captain does not exist",
  "data": {}
}
```

* **Incorrect password**

```json
{
  "success": false,
  "message": "Failed to login captain",
  "error": "Invalid email or password",
  "data": {}
}
```

---

## `/captain/profile` Endpoint

### Description

Retrieves the authenticated captain's profile information.

---

### HTTP Method

`GET`

---

### Authentication

Requires a valid JWT token, provided either as:

* **HTTP-only cookie** (`captainToken`)
  **or**
* **Authorization header**: `Bearer <token>`

---

### Example Request

```http
GET /api/v1/captain/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Successful Response (`200`)

```json
{
  "success": true,
  "message": "Captain profile retrieved successfully",
  "data": {
    "_id": "captain_id",
    "fullname": {
      "firstname": "Alice",
      "lastname": "Smith"
    },
    "email": "alice.smith@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "XYZ123",
      "capacity": 4,
      "vehicleType": "car"
    }
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
  "message": "Captain not found"
}
```

#### `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to retrieve captain profile",
  "error": "Error details"
}
```

---

## `/captain/logout` Endpoint

### Description

Logs out the captain by blacklisting the provided JWT token and clearing the cookie. Prevents future use of the same token.

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
POST /api/v1/captain/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Successful Response (`200`)

```json
{
  "success": true,
  "message": "Captain logged out successfully"
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
  "message": "Failed to logout captain",
  "error": "Error details"
}
```