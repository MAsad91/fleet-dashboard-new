# Backend API Setup Guide

## 🚀 Real Backend Authentication Enabled!

The application has been configured to use real backend API authentication instead of mock authentication.

## 📋 Required Backend API Endpoints

Your backend API should provide these endpoints:

### Authentication Endpoints
- `POST /users/login_with_password/` - User login
- `POST /users/refresh_token/` - Refresh access token  
- `GET /users/users/me/` - Get current user info

### Fleet Management Endpoints
- `GET /fleet/dashboard/summary/` - Dashboard summary
- `GET /fleet/vehicles/` - List vehicles
- `GET /fleet/drivers/` - List drivers
- `GET /fleet/trips/` - List trips
- `GET /fleet/alerts/` - List alerts
- `GET /fleet/maintenance/` - Maintenance data
- And many more...

## ⚙️ Configuration

### 1. Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NODE_ENV=development
```

### 2. API Base URL
- Default: `http://localhost:8000`
- Change `NEXT_PUBLIC_API_BASE_URL` to match your backend URL

### 3. Authentication Flow
1. User enters email/password
2. Frontend calls `POST /users/login_with_password/`
3. Backend returns `access_token` and `refresh_token`
4. Tokens are stored in localStorage and cookies
5. All subsequent API calls include `Authorization: Bearer <token>`

## 🔧 Backend Requirements

### Login Endpoint (`POST /users/login_with_password/`)
**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "avatar": "/path/to/avatar.png",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Current User Endpoint (`GET /users/users/me/`)
**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "1",
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin",
  "avatar": "/path/to/avatar.png",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Refresh Token Endpoint (`POST /users/refresh_token/`)
**Request Body:**
```json
{
  "refresh": "<refresh_token>"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 🧪 Testing

### Admin Credentials Provided:
- **Username**: `testadmin`
- **Password**: `testadmin123`
- **Role**: Admin

### Testing Steps:
1. **Start your backend API** on `http://localhost:8000`
2. **Start the frontend**: `npm run dev`
3. **Visit**: `http://localhost:3001`
4. **Login** with the provided admin credentials:
   - Username: `testadmin`
   - Password: `testadmin123`

### Test API Connection:
Run the test script to verify backend connectivity:
```bash
node test-credentials.js
```

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend allows requests from `http://localhost:3001`
2. **404 Errors**: Verify your API endpoints match the expected URLs
3. **401 Errors**: Check that your authentication tokens are valid
4. **Network Errors**: Ensure your backend is running and accessible

### Debug Mode:
- Check browser console for API call logs
- Check Network tab for failed requests
- Verify token storage in localStorage

## 📝 Notes

- The application now uses **real API authentication**
- **Mock authentication has been disabled**
- All API calls will hit your backend server
- Token refresh is handled automatically
- Error handling includes proper token cleanup
