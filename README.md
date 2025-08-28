# Community Talk 💬

A full-stack, real-time chat application designed for communities to connect and communicate instantly. Built with the MERN stack (MongoDB, Express, React, Node.js) and featuring a secure authentication system to ensure private and safe conversations.




## About The Project

Community Talk is a modern web application that provides users with a seamless and interactive platform for real-time communication. The project leverages WebSockets for instant messaging and follows modern security best practices, including JWT authentication and password hashing, to create a safe and engaging user experience.

## Built With

The application is built with a modern, full-stack JavaScript toolchain.

* **Frontend:**
    * [React.js](https://reactjs.org/)
    * [Vite](https://vitejs.dev/)
    * [React Router](https://reactrouter.com/)
    * [Socket.IO Client](https://socket.io/docs/v4/client-api/)
    * [Axios](https://axios-http.com/)
    * [Bootstrap](https://getbootstrap.com/)
* **Backend:**
    * [Node.js](https://nodejs.org/)
    * [Express.js](https://expressjs.com/)
    * [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
    * [Socket.IO](https://socket.io/)
    * [JSON Web Tokens (JWT)](https://jwt.io/) for Authentication
    * [bcrypt.js](https://www.npmjs.com/package/bcrypt) for Password Hashing
    * [Helmet](https://helmetjs.github.io/) for Security Headers
    * [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit) for Brute-force Protection

## Key Features

* 🔐 **Secure User Authentication**: Full registration and login system using JWT and bcrypt.
* ⚡ **Real-Time Chat**: Instant messaging powered by WebSockets via Socket.IO.
* 🛡️ **Secure Backend**: Protected API routes and security best practices with Helmet and rate limiting.
* 📱 **Responsive Design**: A clean user interface built with Bootstrap that works on all devices.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* Node.js (v18 or later recommended)
* npm (comes with Node.js)
* A MongoDB Atlas account or a local MongoDB installation.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone YOUR_REPO_LINK_HERE
    cd your-repo-name
    ```
2.  **Install backend dependencies:**
    ```sh
    cd backend
    npm install
    ```
3.  **Install frontend dependencies:**
    ```sh
    cd ../frontend
    npm install
    ```

### Configuration

1.  In the `backend` directory, create a new file named `.env`.
2.  Add the following required environment variables. You will need to provide your own MongoDB connection string and create a secret for JWT.

    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=a_strong_secret_string_for_your_tokens
    PORT=5001
    ```

### Running the Application

1.  **Start the backend server** (from the `backend` directory):
    ```sh
    npm start
    ```
2.  **Start the frontend client** (from the `frontend` directory in a new terminal):
    ```sh
    npm run dev
    ```
3.  Open your browser and go to `http://localhost:5173` (or the port specified by Vite).

## Contact

Harpreet Singh - [harpreetsingh.co](https://harpreetsingh.co)
