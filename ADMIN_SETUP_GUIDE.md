# 🚀 Admin Setup Guide - Fleet Dashboard

## ✅ **Admin Credentials Configured!**

Your project has been configured with the provided admin credentials:

- **Username**: `testadmin`
- **Password**: `testadmin123`
- **Role**: Admin

## 🔧 **Current Status**

✅ **Frontend**: Ready and configured  
✅ **Authentication**: Real API integration enabled  
✅ **Environment**: Configured for backend API  
❌ **Backend API**: Not running (needs to be started)

## 📋 **Required Backend API**

Your backend API must be running on `http://localhost:8000` with these endpoints:

### 🔑 **Authentication Endpoints**
```
POST /users/login_with_password/
GET /users/users/me/
POST /users/refresh_token/
```

### 🚛 **Fleet Management Endpoints**
```
GET /fleet/dashboard/summary/
GET /fleet/vehicles/
GET /fleet/drivers/
GET /fleet/trips/
GET /fleet/alerts/
GET /fleet/maintenance/
```

## 🚀 **Quick Start**

### 1. **Start Your Backend API**
```bash
# Make sure your backend is running on port 8000
# Your API should handle the admin credentials:
# Username: testadmin
# Password: testadmin123
```

### 2. **Start the Frontend**
```bash
npm run dev
```

### 3. **Access the Dashboard**
- **URL**: `http://localhost:3001`
- **Login**: Use the admin credentials above

## 🧪 **Test Your Setup**

### Test Backend Connection:
```bash
node test-credentials.js
```

### Test Frontend:
1. Go to `http://localhost:3001`
2. You should see the sign-in page
3. Enter credentials:
   - Username: `testadmin`
   - Password: `testadmin123`
4. Click "Sign In"
5. You should be redirected to the fleet dashboard

## 🔍 **Expected API Response**

When you login, your backend should return:

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "1",
    "email": "testadmin@example.com",
    "name": "Test Admin",
    "role": "admin",
    "avatar": "/path/to/avatar.png",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## 🐛 **Troubleshooting**

### If Login Fails:
1. **Check Backend**: Is your API running on port 8000?
2. **Check Credentials**: Are the credentials correct in your backend?
3. **Check CORS**: Does your backend allow requests from `http://localhost:3001`?
4. **Check Console**: Look for error messages in browser console

### If Backend is Not Ready:
- The frontend will show "Redirecting..." and then redirect to sign-in
- You'll see network errors in the browser console
- The application is configured correctly, just waiting for the backend

## 📁 **Files Created/Modified**

- ✅ `.env.local` - Environment configuration
- ✅ `test-credentials.js` - Backend connection test
- ✅ `setup-admin.js` - Admin setup script
- ✅ `BACKEND_SETUP.md` - Complete backend setup guide
- ✅ `src/contexts/AuthContext.tsx` - Real authentication enabled
- ✅ `src/lib/api-client.ts` - API client configured

## 🎯 **Next Steps**

1. **Start your backend API** with the admin credentials
2. **Test the connection** using the test script
3. **Access the dashboard** and verify admin functionality
4. **Configure additional fleet data** as needed

## 📞 **Need Help?**

If you encounter any issues:
1. Check the browser console for errors
2. Run the test script to verify backend connectivity
3. Ensure your backend API matches the expected endpoints
4. Verify the admin credentials are properly configured in your backend

---

**Your Fleet Dashboard is ready for admin access! 🚀**

