# Authentication Debugging Guide

This guide explains common authentication issues in FixNow and how to resolve them.

## 1. Login Fails with "Network Error" or "Failed to fetch"

**Cause:** The frontend cannot reach the backend server.
**Solutions:**
- Ensure the backend server is running (`cd backend && npm start` or `node server.js`).
- Verify the backend is listening on `http://localhost:5000`.
- Check if CORS is properly configured in `backend/server.js`. The `origin` must exactly match the frontend URL (e.g., `http://localhost:5173`).

## 2. Page Refresh Causes Logout

**Cause:** The authentication state is stored only in React state and is lost on refresh, or the token is not correctly loaded from `localStorage`.
**Solutions:**
- We implemented a fix in `AuthContext.tsx` that uses a `useEffect` on mount. This effect retrieves the token from `localStorage` and calls the `/api/v1/auth/me` endpoint to verify the user and hydrate the session. 
- Ensure that `localStorage.getItem("fixnow_token")` correctly returns a valid token.
- Ensure the backend `/me` endpoint is functioning and returning a 200 OK with user data. If the token is expired, the backend returns 401, and the frontend will clear the token and require login again.

## 3. "Invalid Credentials" or "User not found"

**Cause:** The user does not exist in the MongoDB database, or the password does not match the hashed password.
**Solutions:**
- If you just restarted the server and you are using `MongoMemoryServer` (in-memory database), all users are deleted on restart. You must recreate the user.
- To prevent this, use a real MongoDB connection by setting `MONGO_URI` in `backend/.env`.

## 4. Protected Routes Rejecting Valid Tokens

**Cause:** The backend isn't receiving the token, or it's improperly formatted.
**Solutions:**
- The frontend must send the token in the `Authorization` header:
  ```json
  "Authorization": "Bearer <your_token_here>"
  ```
- Check `backend/src/middleware/auth.middleware.js` to ensure it parses the token correctly using `token = req.headers.authorization.split(' ')[1]`.

## 5. Token is Not Being Saved on Login/Signup

**Cause:** The backend response format does not match what the frontend expects.
**Solutions:**
- In `backend/src/controllers/auth.controller.js`, ensure the response looks like:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": { ... },
      "accessToken": "ey...",
      "refreshToken": "ey..."
    }
  }
  ```
- In the frontend `AuthContext.tsx`, ensure we parse it as `const { user, accessToken } = data.data;` (which is correctly implemented).

## Tools for Debugging
1. **Browser Network Tab:** Open Developer Tools (F12) -> Network. Look at the `/login` request. Check the Request Headers (Payload) and Response (Preview/Response tab) to see exact errors.
2. **Backend Console Logs:** Watch the Node.js console for crash reports or specific validation errors (e.g., Mongoose validation errors).
