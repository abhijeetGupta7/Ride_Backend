# 🚕 Ridee – Backend

This is the backend service for **Ridee**, a real-time ride-sharing platform. It’s built with Node.js, Express, MongoDB, Socket.io and Redis (Upstash), and exposes RESTful APIs and WebSocket events to power the Ridee frontend.

---

## 📚 Table of Contents

* [Key Features](#-key-features)
* [Tech Stack](#-tech-stack)
* [Environment Variables](#environment-variables)
* [Getting Started](#-getting-started-local)
* [Deployment](#-deployment)
* [API Documentation](#api-documentation)
  * [User Routes](#user-routes)
  * [Captain Routes](#captain-routes)
  * [Ride Routes](#ride-routes)
  * [Maps Routes](#maps-routes)

---

## 🎯 Key Features

- **Authentication & Authorization**  
  • JWT-based login & registration for Users and Captains  
  • Token blacklisting on logout  
- **Ride Lifecycle**  
  • Create, accept, start, complete and cancel rides  
  • Fare estimation for multiple vehicle types  
- **Real-Time Notifications**  
  • New‐ride, driver-found, ride-started, ride-completed, ride-request-cancelled events via Socket.io  
- **Geospatial Queries**  
  • Find nearby captains within a radius for incoming ride requests  
- **Redis Caching & State**  
  • Track which captains have been notified for a ride  
  • Store captain socket mappings for efficient real-time messaging  
- **Feedback**  
  • Users can submit ride feedback after completion  

---

## 🛠 Tech Stack

| Layer           | Technology                       |
|-----------------|----------------------------------|
| Runtime         | Node.js (v22.x)                  |
| Framework       | Express.js (v5)                  |
| Database        | MongoDB + Mongoose               |
| Real-Time       | Socket.io (v4)                   |
| Caching/State   | Upstash Redis (Redis + ioredis)  |
| Auth            | JSON Web Tokens (jsonwebtoken)   |
| Validation      | express-validator                |
| Config & Env    | dotenv                           |
| Utilities       | bcrypt, axios                    |
| Dev Tools       | nodemon                          |

---


## Environment Variables 

Create a `.env` file in the project root with:

```env
# Server
PORT=8050
NODE_ENV=development  #  set to production for deployment

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ridee

# JWT
JWT_SECRET=your_jwt_secret

# CORS
CLIENT_URL=https://ride-frontend.onrender.com

# Redis / Upstash
REDIS_URI=redis://localhost:6379        # for local dev
UPSTASH_REDIS_REST_URL=https://<upstash-id>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
````

---

## 🚀 Getting Started (Local)

1. **Clone the repo**

   ```bash
   git clone https://github.com/abhijeetGupta7/Ride_Backend
   cd Ride_Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start MongoDB & Redis locally** 

4. **Run the server**

   ```bash
   npm run start
   ```

   * The API will be available at `http://localhost:8050`

5. **Socket.io**

   * Clients should connect to `ws://localhost:8050` or the same origin to receive real-time events.

---

## 🚀 Deployment

### Live Backend URL
[https://ride-backend-m1x6.onrender.com](https://ride-backend-m1x6.onrender.com)

### Prerequisites
- MongoDB Atlas cluster
- Upstash Redis database
- Render.com account (or alternative hosting)

### Deployment Steps

1. **Set up MongoDB Atlas**:
   - Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Whitelist IP `0.0.0.0/0` (temporarily) or your Render server IP
   - Get connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/ridee
     ```

2. **Configure Upstash Redis**:
   - Create database at [upstash.com](https://upstash.com)
   - Copy REST URL and token

3. **Prepare Environment Variables**:
   - Already given in the Environment Variables section above
   
4. **Deploy to Render**:
   - Connect your GitHub repository
   - Set environment variables in Render dashboard
   - Use these build settings:
     ```
     Build Command: npm install
     Start Command: node index.js
     ```
   - Enable "Auto-Deploy" on git push

---

## API Documentation

### Base URL

```
http://localhost:<PORT>/api/v1
```

---

## User Routes

## `/user/register` Endpoint

### Description
Registers a new user by creating a user account with the provided information.

### HTTP Method
`POST`

### Request Body
```json
{
  "fullname": {
    "firstname": "string (required, min 3 chars)",
    "lastname": "string (optional, min 3 chars if provided)"
  },
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)"
}
```

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

### Successful Response (`201`)
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
Authenticates a user and returns a JWT token with user data.

### HTTP Method
`POST`

### Request Body
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### Example Request
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Successful Response (`200`)
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

### Error Responses
#### `401 Unauthorized`
```json
{
  "success": false,
  "message": "Failed to login user",
  "error": "User does not exist",
  "data": {}
}
```

## `/user/profile` Endpoint

### Description
Retrieves the authenticated user's profile information.

### HTTP Method
`GET`

### Authentication
Required: JWT token (Cookie or Authorization header)

### Example Request
```http
GET /api/v1/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

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
  }
}
```

## `/user/logout` Endpoint

### Description
Logs out the user by invalidating the JWT token.

### HTTP Method
`POST`

### Authentication
Required: JWT token (Authorization header)

### Example Request
```http
POST /api/v1/user/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Successful Response (`200`)
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```
---

## Captain Routes

## `/captain/register` Endpoint

### Description
Registers a new captain with vehicle details.

### HTTP Method
`POST`

### Request Body
```json
{
  "fullname": {
    "firstname": "string (required, min 3 chars)",
    "lastname": "string (optional, min 3 chars if provided)"
  },
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "vehicle": {
    "color": "string (required)",
    "plate": "string (required)",
    "capacity": "number (required)",
    "vehicleType": "string (required: car/bike/auto)"
  }
}
```

### Example Request
```json
{
  "fullname": {
    "firstname": "Test",
    "lastname": "Captain"
  },
  "email": "test4d.captain@example.com",
  "password": "password123",
  "vehicle": {
    "color": "Black",
    "plate": "TEST1234",
    "capacity": 6,
    "vehicleType": "car"
  }
}
```

### Successful Response (`201`)
```json
{
  "success": true,
  "message": "Captain registered successfully",
  "data": {
    "captain": {
      "_id": "682b81c52b57c9d2f7b1cae2",
      "fullname": {
        "firstname": "Test",
        "lastname": "Captain"
      },
      "email": "test4d.captain@example.com",
      "status": "inactive",
      "vehicle": {
        "color": "Black",
        "plate": "TEST1234",
        "capacity": 6,
        "vehicleType": "car"
      }
    },
    "token": "jwt_token_here"
  }
}
```

## `/captain/login` Endpoint

### Description
Authenticates a captain and returns profile with token.

### HTTP Method
`POST`

### Request Body
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### Successful Response (`200`)
```json
{
  "success": true,
  "message": "Captain logged in successfully",
  "data": {
    "captain": {
      "_id": "682b80731be0ff7aad7df64a",
      "fullname": {
        "firstname": "Test",
        "lastname": "Captain"
      },
      "email": "test2.captain@example.com",
      "status": "inactive",
      "vehicle": {
        "color": "Black",
        "plate": "TEST1234",
        "capacity": 6,
        "vehicleType": "car"
      }
    },
    "token": "jwt_token_here"
  }
}
```

## `/captain/profile` Endpoint

### Description
Retrieves authenticated captain's profile.

### HTTP Method
`GET`

### Authentication
Required: JWT token

### Successful Response (`200`)
```json
{
  "success": true,
  "message": "Captain profile retrieved successfully",
  "data": {
    "_id": "682b80731be0ff7aad7df64a",
    "fullname": {
      "firstname": "Test",
      "lastname": "Captain"
    },
    "email": "test2.captain@example.com",
    "status": "inactive",
    "vehicle": {
      "color": "Black",
      "plate": "TEST1234",
      "capacity": 6,
      "vehicleType": "car"
    }
  }
}
```

## `/captain/logout` Endpoint

### Description
Invalidates captain's authentication token.

### HTTP Method
`POST`

### Successful Response (`200`)
```json
{
  "success": true,
  "message": "Captain logged out successfully"
}
```

## `/captains-in-radius` Endpoint

### Description
Finds available captains within geographic radius.

### HTTP Method
`GET`

### Query Parameters
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| latitude | float | Yes | -90 to 90 |
| longitude | float | Yes | -180 to 180 |
| radius | integer | Yes | Min: 1 |
| vehicleType | string | No | car/bike/auto |

### Successful Response (`200`)
```json
{
  "success": true,
  "data": [
    {
      "fullname": {
        "firstname": "Abhijeet",
        "lastname": "Kumar Gupta"
      },
      "vehicle": {
        "color": "RED",
        "plate": "7777",
        "capacity": 4,
        "vehicleType": "car"
      },
      "location": {
        "coordinates": [80.8997, 26.8715]
      },
      "_id": "683da2f34db3a4dc6929b626",
      "email": "c@c.com",
      "status": "active"
    }
  ],
  "message": "Captains fetched successfully"
}
```

## `/captain/update-location` Endpoint

### Description
Updates captain's geographic coordinates.

### HTTP Method
`PUT`

### Request Body
```json
{
  "latitude": "float (required, -90 to 90)",
  "longitude": "float (required, -180 to 180)"
}
```

### Successful Response (`200`)
```json
{
  "success": true,
  "data": {
    "fullname": {
      "firstname": "Test",
      "lastname": "Captain"
    },
    "vehicle": {
      "color": "Black",
      "plate": "TEST1234",
      "capacity": 6,
      "vehicleType": "car"
    },
    "location": {
      "coordinates": [77.209, 28.6139]
    },
    "_id": "682b80731be0ff7aad7df64a",
    "status": "active"
  },
  "message": "Captain location updated successfully"
}
```

---

## Maps Routes

## `/maps/coordinates` Endpoint

### Description
Converts a human-readable address into geographic coordinates (latitude and longitude) using geocoding services.

### HTTP Method
`GET`

### Query Parameters
| Parameter | Type   | Required | Description                     | Constraints                     |
|-----------|--------|----------|---------------------------------|---------------------------------|
| address   | string | Yes      | The address to geocode          | Minimum 3 characters            |

### Example Request
```http
GET /api/v1/maps/coordinates?address=Connaught+Place+New+Delhi
```

### Successful Response (`200`)
```json
{
  "success": true,
  "error": {},
  "data": {
    "lng": 83.3731675,
    "lat": 26.7605545
  },
  "message": "Coordinates fetched successfully"
}
```

### Error Responses

#### `400 Bad Request` (Validation Error)
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "address": "Address must be at least 3 characters long"
  },
  "data": null
}
```

#### `404 Not Found` (Address Not Found)
```json
{
  "success": false,
  "message": "Address not found",
  "error": "Could not geocode the provided address",
  "data": null
}
```

#### `500 Internal Server Error`
```json
{
  "success": false,
  "message": "Failed to fetch coordinates",
  "error": "Geocoding service unavailable",
  "data": null
}
```

---

## `/maps/distance-duration` Endpoint

### Description
Calculates the travel distance and duration between two locations (origin and destination) for route planning.

### HTTP Method
`GET`

### Query Parameters
| Parameter    | Type   | Required | Description                     |
|--------------|--------|----------|---------------------------------|
| origin       | string | Yes      | Starting point address/coordinates |
| destination  | string | Yes      | End point address/coordinates   |

### Example Request
```http
GET /api/v1/maps/distance-duration?origin=28.6139,77.2090&destination=28.4595,77.0266
```

### Successful Response (`200`)
```json
{
  "success": true,
  "error": {},
  "data": {
    "distance": {
      "text": "5.0 km",
      "value": 4955
    },
    "duration": {
      "text": "12 mins",
      "value": 704
    }
  },
  "message": "Distance and duration fetched successfully"
}
```

### Error Responses

#### `400 Bad Request` (Missing Parameters)
```json
{
  "success": false,
  "message": "Missing required parameters",
  "error": {
    "origin": "Origin cannot be empty",
    "destination": "Destination cannot be empty"
  },
  "data": null
}
```

#### `404 Not Found` (Route Not Found)
```json
{
  "success": false,
  "message": "Could not calculate route",
  "error": "No valid route between the specified locations",
  "data": null
}
```

#### `500 Internal Server Error`
```json
{
  "success": false,
  "message": "Failed to calculate distance/duration",
  "error": "Routing service unavailable",
  "data": null
}
```

---

## `/maps/auto-suggestions` Endpoint

### Description
Provides autocomplete suggestions for addresses based on partial user input, helping users quickly select valid locations.

### HTTP Method
`GET`

### Query Parameters
| Parameter | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| input     | string | Yes      | Partial address input           |

### Example Request
```http
GET /api/v1/maps/auto-suggestions?input=Connaught
```

### Successful Response (`200`)
```json
{
  "success": true,
  "error": {},
  "data": [
    {
      "prediction": {
        "description": "Connaught Place, New Delhi, Delhi, India",
        "place_id": "ChIJV9BBtzf9DDkR8cOTc-SI7s0",
        "structured_formatting": {
          "main_text": "Connaught Place",
          "secondary_text": "New Delhi, Delhi, India"
        }
      }
    },
    {
      "prediction": {
        "description": "Connaught Place Social, New Delhi",
        "place_id": "ChIJn6jFcKT9DDkRSbsVBMHSqbQ",
        "structured_formatting": {
          "main_text": "Connaught Place Social",
          "secondary_text": "New Delhi"
        }
      }
    }
  ],
  "message": "Suggestions fetched successfully"
}
```

---

## Ride Routes

## `/ride/create` Endpoint

### Description
Creates a new ride request and notifies nearby captains.

### HTTP Method
`POST`

### Authentication
User JWT required

### Request Body
```json
{
  "pickup": {
    "address": "string (required)",
    "coordinates": "[longitude, latitude]"
  },
  "destination": {
    "address": "string (required)",
    "coordinates": "[longitude, latitude]"
  },
  "vehicleType": "string (required: car/auto/bike)"
}
```

### Successful Response (`201`)
```json
{
  "success": true,
  "data": {
    "pickup": {
      "coordinates": [83.3731675, 26.7605545],
      "address": "Gorakhpur, Uttar Pradesh, India"
    },
    "destination": {
      "coordinates": [83.3854141, 26.7947934],
      "address": "Raptinagar, Gorakhpur"
    },
    "fare": 193,
    "status": "pending",
    "duration": 18,
    "distance": 6.025,
    "vehicleType": "car",
    "otp": "969220",
    "_id": "684c75aa038dcb2d427cf9e1"
  },
  "message": "Ride created successfully"
}
```

## `/ride/accept` Endpoint

### Description
Allows a captain to accept a ride request.

### HTTP Method
`PATCH`

### Authentication
Captain JWT required

### Request Body
```json
{
  "rideId": "string (required)",
  "captainId": "string (required)"
}
```

### Successful Response (`200`)
```json
{
  "success": true,
  "data": {
    "status": "accepted",
    "captain": {
      "fullname": {
        "firstname": "Test",
        "lastname": "Captain"
      },
      "vehicle": {
        "color": "Black",
        "plate": "TEST1234",
        "capacity": 6,
        "vehicleType": "car"
      }
    }
  },
  "message": "Ride accepted successfully"
}
```

## `/ride/start` Endpoint

### Description
Starts the ride after verifying OTP.

### HTTP Method
`PATCH`

### Authentication
Captain JWT required

### Request Body
```json
{
  "rideId": "string (required)",
  "otp": "string (required)"
}
```

### Successful Response (`200`)
```json
{
  "success": true,
  "data": {
    "status": "ongoing"
  },
  "message": "Ride started successfully"
}
```

## `/ride/complete` Endpoint

### Description
Marks the ride as completed.

### HTTP Method
`PATCH`

### Authentication
Captain JWT required

### Request Body
```json
{
  "rideId": "string (required)"
}
```

### Successful Response (`200`)
```json
{
  "success": true,
  "data": {
    "status": "completed"
  },
  "message": "Ride completed successfully"
}
```

## `/ride/feedback` Endpoint

### Description
Adds feedback to a completed ride.

### HTTP Method
`PATCH`

### Authentication
User JWT required

### Request Body
```json
{
  "rideId": "string (required)",
  "feedback": {
    "rating": "number (required)",
    "comment": "string (optional)"
  }
}
```

### Successful Response (`200`)
```json
{
  "success": true,
  "data": {
    "feedback": {
      "rating": 4,
      "comment": "awesome"
    }
  },
  "message": "Feedback added successfully"
}
```

## `/ride/cancel` Endpoint

### Description
Cancels a pending ride.

### HTTP Method
`PATCH`

### Authentication
User JWT required

### Request Body
```json
{
  "rideId": "string (required)"
}
```

### Successful Response (`200`)
```json
{
  "success": true,
  "data": {
    "status": "cancelled"
  },
  "message": "Ride cancelled successfully"
}
```

## `/ride/estimate-fare` Endpoint

### Description
Estimates fare for a single vehicle type.

### HTTP Method
`GET`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pickup | string | Yes | Pickup location address |
| destination | string | Yes | Destination address |
| vehicleType | string | Yes | car/auto/bike |

### Successful Response (`200`)
```json
{
  "success": true,
  "data": {
    "fare": 14872,
    "distance": 849.661,
    "duration": 692.4
  },
  "message": "Fare estimated successfully"
}
```

## `/ride/estimate-fare-all` Endpoint

### Description
Estimates fares for all vehicle types.

### HTTP Method
`GET`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pickup | string | Yes | Pickup location address |
| destination | string | Yes | Destination address |

### Successful Response (`200`)
```json
{
  "success": true,
  "data": {
    "car": {
      "fare": 14872,
      "distance": 849.661,
      "duration": 692.4
    },
    "auto": {
      "fare": 9911,
      "distance": 849.661,
      "duration": 692.4
    },
    "bike": {
      "fare": 7856,
      "distance": 849.661,
      "duration": 692.4
    }
  },
  "message": "Fare estimates for all vehicle types"
}
```










