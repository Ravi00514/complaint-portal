# REST API Documentation - CivicConnect

All API requests return a structured JSON response in the following format:
```json
{
  "success": true, // or false
  "message": "Information text.",
  "data": { ... } // or array, or null
}
```

---

## 1. Authentication Endpoints

### Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Body Parameters**:
  ```json
  {
    "name": "Citizen Name",
    "phone": "+919876543210",
    "email": "citizen@gov.in",
    "password": "secure_password"
  }
  ```
* **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 2,
        "name": "Citizen Name",
        "email": "citizen@gov.in",
        "phone": "+919876543210",
        "isAdmin": false,
        "createdAt": "2026-07-30T14:00:00.000Z"
      }
    }
  }
  ```

### Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Body Parameters**:
  ```json
  {
    "email": "admin@civicconnect.gov.in",
    "password": "admin123"
  }
  ```
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "name": "System Administrator",
        "email": "admin@civicconnect.gov.in",
        "phone": "+919999999999",
        "isAdmin": true,
        "createdAt": "2026-07-30T14:00:00.000Z"
      }
    }
  }
  ```

---

## 2. Geocoding / Location Endpoints

### Reverse Geocode Coords
* **URL**: `/api/location`
* **Method**: `GET`
* **Query Parameters**:
  * `latitude` (required, double)
  * `longitude` (required, double)
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Location details retrieved successfully.",
    "data": {
      "city": "Bengaluru",
      "district": "Bengaluru Urban",
      "state": "Karnataka",
      "country": "India",
      "pincode": "560001",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "formatted_address": "Bengaluru, Karnataka, India"
    }
  }
  {
    "success": true,
    "message": "Location details retrieved successfully.",
    "data": {
      "city": "Guntur",
      "district": "Guntur Urban",
      "state": "Andhra Pradesh",
      "country": "India",
      "pincode": "5",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "formatted_address": "Bengaluru, Karnataka, India"
    }
  }
  ```

---

## 3. Department & Nearest Locator Endpoints

### List Departments
* **URL**: `/api/departments`
* **Method**: `GET`
* **Query Parameters** (optional): `department_name`, `city`, `district`, `search` (general match)
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Departments fetched successfully.",
    "data": [
      {
        "id": 1,
        "department_name": "Electricity Department",
        "office_name": "BESCOM Indiranagar",
        "officer_name": "Mr. Ramesh Kumar",
        "phone": "+918025251111",
        "city": "Bengaluru",
        "state": "Karnataka",
        "status": "Open"
      }
    ]
  }
  ```

### Find Nearest Departments (PostGIS KNN Spatial)
* **URL**: `/api/departments/nearest`
* **Method**: `GET`
* **Query Parameters**:
  * `latitude` (required, double)
  * `longitude` (required, double)
  * `category` (optional, complaint category name like "Power Cut")
  * `limit` (optional, integer, default 5)
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Nearest departments found.",
    "data": [
      {
        "id": 1,
        "department_name": "Electricity Department",
        "office_name": "BESCOM Indiranagar",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "distance_meters": 5420.24,
        "distance_text": "5.4 km",
        "status": "Open"
      }
    ]
  }
  ```

---

## 4. Emergency Contacts Endpoints

### List Emergency Helplines
* **URL**: `/api/emergency`
* **Method**: `GET`
* **Query Parameters** (optional): `city`, `state`
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Emergency contacts fetched successfully.",
    "data": [
      {
        "id": 1,
        "department": "National Emergency Number",
        "phone": "112",
        "city": "All",
        "state": "All"
      }
    ]
  }
  ```

---

## 5. Bookmarks Endpoints (Auth Guarded)

*Headers must contain: `Authorization: Bearer <token>`*

### Get Bookmarked Departments
* **URL**: `/api/bookmarks`
* **Method**: `GET`
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Bookmarks fetched successfully.",
    "data": [
      {
        "id": 1,
        "department_name": "Electricity Department",
        "office_name": "BESCOM Indiranagar"
      }
    ]
  }
  ```

### Save Bookmark
* **URL**: `/api/bookmarks`
* **Method**: `POST`
* **Body Parameters**:
  ```json
  {
    "department_id": 1
  }
  ```
* **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Department bookmarked successfully.",
    "data": {
      "department_id": 1
    }
  }
  ```

### Delete Bookmark
* **URL**: `/api/bookmarks/:departmentId`
* **Method**: `DELETE`
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Bookmark removed successfully.",
    "data": {
      "department_id": 1
    }
  }
  ```
