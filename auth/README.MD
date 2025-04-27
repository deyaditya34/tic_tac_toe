# Authentication Module

This directory contains an independent authentication module designed with robust features such as user registration, secure login token-based authentication etc.

While it is integrated here to serve the Tic Tac Toe application's users, it can be reused or adapted for other applications requiring similar authentication functionalities.

## Features

- User registration with validation
- Secure login with hashed passwords
- Utilizes cookies for maintaining login sessions, which are cleared upon logout

## Technologies Used

- Node.js - backend runtime environment
- Express.js - http server
- MongoDB - storing users
- Crypto - password hashing
- JSON Web Tokens (JWT) - authentication

## Installation

1. Navigate to the `auth` directory:

2. Install dependencies:
   ```
   npm install
   ```
3. Copy the ".env.example" file and rename it as ".env". Modify the values as needed per requirements.

4. Start the server:
   ```
   npm start
   ```

## Start the server and test the authentication endpoints.

### API Details

#### POST _api/auth/register_

- **Description**: Registers a new user by creating an account.
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  - **200 Created**: User successfully registered.
    ```json
    {
      "success": true,
      "data": "user registered successfully"
    }
    ```
  - **400 Bad Request**: Validation error or missing fields.
    ```json
    {
      "success": false,
      "error": "error message"
    }
    ```

#### POST _api/auth/login_

- **Description**: Logs in an existing user and returns a token.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - **200 OK**: Login successful.
    ```json
    {
      "success": true,
      "data": "login successful",
      "token": "string"
    }
    ```
  - **401 Unauthorized**: Invalid credentials.
    ```json
    {
      "success": "false",
      "error": "error message"
    }
    ```

## Note

    In this application only the above two endpoints are used as of now.
    Other endpoints will be used as the game progresses.

## Other Endpoints

- `GET /api/auth/` - List of all the users
- `POST /api/auth/changePassword` - Changes the password of a user
- `POST /api/auth/logout` - Logout the current user
- `GET /api/auth/check-token` - validates the token sent by the user
