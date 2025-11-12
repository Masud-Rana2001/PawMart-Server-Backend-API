# PawMart Server

A RESTful API backend for PawMart, a pet marketplace application built with Express.js and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Error Handling](#error-handling)
- [Future Improvements](#future-improvements)

---

## ✨ Features

- 🐾 Pet listings management (CRUD operations)
- 🛒 Order management system
- 🔍 Search and filter functionality with pagination
- 📦 MongoDB database integration
- 🔐 Firebase authentication setup
- 🍪 Cookie and CORS support
- ✅ Error handling and validation
- 🔄 Real-time data retrieval

---

## 🛠️ Tech Stack

- **Backend Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: Firebase Admin SDK
- **Middleware**: 
  - CORS
  - Cookie Parser
  - JSON Parser
- **Environment Management**: dotenv
- **ID Management**: MongoDB ObjectId

---

## 📥 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PawMart_Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required packages** (if not already installed)
   ```bash
   npm install express dotenv cookie-parser cors mongodb jsonwebtoken firebase-admin
   ```

4. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add required variables (see [Environment Variables](#environment-variables))

5. **Add Firebase service account key**
   - Place your `serviceAccountKey.json` file in the root directory
   - Get it from Firebase Console > Project Settings > Service Accounts

6. **Start the server**
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`

---

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password
POST=3000
```

**Example:**
```env
DB_USERNAME=pawmart_user
DB_PASSWORD=securePassword123
POST=3000
```

**Note**: 
- Ensure your MongoDB cluster is configured and connection string credentials are correct
- Keep `.env` file secure and add it to `.gitignore`

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server health check |

### Listings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/allListing` | Get all listings without pagination |
| GET | `/allList` | Get paginated listings with search & filter |
| GET | `/allList/:id` | Get single listing details |
| GET | `/mylisting/:email` | Get all listings by user email |
| POST | `/listings` | Create a new listing |
| PUT | `/listings/:id` | Update a listing |
| DELETE | `/listings/:id` | Delete a listing |

### Orders Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create a new order |
| GET | `/orders/:email` | Get all orders by buyer email |
| DELETE | `/orders/:id` | Delete an order |

---

## 📊 Request/Response Examples

### Get All Listings (No Pagination)
```bash
GET /allListing
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Golden Retriever",
      "category": "Dogs",
      "price": 500,
      "image": "url_to_image",
      "email": "seller@example.com"
    }
  ]
}
```

### Get Paginated Listings with Filters
```bash
GET /allList?page=1&limit=6&search=dog&category=Dogs
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 6)
- `search`: Search by listing name (optional)
- `category`: Filter by category (optional, use "All" for all)

**Response:**
```json
{
  "total": 25,
  "skip": 0,
  "limit": 6,
  "page": 1,
  "totalPage": 5,
  "data": [...]
}
```

### Get Single Listing Details
```bash
GET /allList/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Golden Retriever",
    "category": "Dogs",
    "price": 500,
    "image": "url_to_image",
    "email": "seller@example.com"
  }
}
```

### Create New Listing
```bash
POST /listings
Content-Type: application/json

{
  "name": "Golden Retriever",
  "category": "Dogs",
  "price": 500,
  "image": "url_to_image",
  "email": "seller@example.com",
  "description": "Healthy and friendly dog"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "insertedId": "507f1f77bcf86cd799439011"
  }
}
```

### Update Listing
```bash
PUT /listings/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "price": 550,
  "name": "Golden Retriever - Updated"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing updated successfully",
  "data": {
    "modifiedCount": 1
  }
}
```

### Delete Listing
```bash
DELETE /listings/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Listing deleted successfully",
  "data": {
    "deletedCount": 1
  }
}
```

### Create Order
```bash
POST /orders
Content-Type: application/json

{
  "buyerEmail": "buyer@example.com",
  "listingId": "507f1f77bcf86cd799439011",
  "price": 500,
  "petName": "Golden Retriever"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "insertedId": "507f1f77bcf86cd799439012"
  }
}
```

### Get User Orders
```bash
GET /orders/buyer@example.com
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "buyerEmail": "buyer@example.com",
      "listingId": "507f1f77bcf86cd799439011",
      "price": 500
    }
  ]
}
```

### Get User Listings
```bash
GET /mylisting/seller@example.com
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### Delete Order
```bash
DELETE /orders/507f1f77bcf86cd799439012
```

**Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully",
  "data": {
    "deletedCount": 1
  }
}
```

---

## 📁 Project Structure

```
PawMart_Server/
├── index.js                    # Main server file
├── .env                        # Environment variables (not in repo)
├── .gitignore                  # Git ignore file
├── serviceAccountKey.json      # Firebase service account key (not in repo)
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked versions
└── README.md                   # This file
```

---

## 🚀 Usage

### Running the Server

```bash
npm start
```

Output:
```
app listening on port 3000
Pinged your deployment. You successfully connected to MongoDB!
```

### Development Mode (with nodemon)

```bash
npm install -D nodemon
npm run dev
```

Add to `package.json`:
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

### Testing Endpoints

Use **Postman**, **Insomnia**, or **cURL** to test endpoints:

```bash
# Get all listings
curl http://localhost:3000/allListing

# Create a listing
curl -X POST http://localhost:3000/listings \
  -H "Content-Type: application/json" \
  -d '{"name":"Dog","category":"Pets","price":500}'
```

---

## 🔒 Error Handling

The API returns JSON responses with consistent error format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200`: OK - Request successful
- `201`: Created - Resource created successfully
- `400`: Bad Request - Invalid request data
- `401`: Unauthorized - Authentication required
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

---

## 🔐 Security Notes

- ⚠️ Never commit `.env` file to version control
- ⚠️ Never commit `serviceAccountKey.json` to version control
- Add both to `.gitignore`
- Firebase authentication middleware is currently commented (uncomment for production)
- CORS is enabled for all origins (customize in production)
- Implement proper authorization before deploying

---

## 📝 Future Improvements

- [ ] Enable Firebase authentication
- [ ] Implement JWT token verification
- [ ] Add role-based access control (RBAC)
- [ ] Input validation and sanitization
- [ ] Rate limiting
- [ ] Comprehensive logging with Winston
- [ ] Unit and integration tests
- [ ] API documentation with Swagger
- [ ] Implement pagination helper functions
- [ ] Add filtering helpers
- [ ] Database indexes for performance
- [ ] Caching strategy

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify `DB_USERNAME` and `DB_PASSWORD` in `.env`
- Check MongoDB cluster is active
- Ensure IP address is whitelisted in MongoDB Atlas

### Firebase Token Errors
- Verify `serviceAccountKey.json` is valid
- Check Firebase project is initialized correctly

### CORS Errors
- Update CORS origin in index.js for your frontend URL
- Ensure credentials are set correctly

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## 📧 Support & Contact

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact the development team

---

## 📄 License

This project is licensed under the MIT License.

---

**Last Updated**: November 2025
**Version**: 1.0.0