📦 The Time Capsule API
The Time Capsule API is a Node.js (Express) based backend that allows users to create, retrieve, and manage time-locked message capsules. Capsules are encrypted messages set to unlock at a specific date in the future. JWT-based authentication is used to secure user access.

🚀 Features
✅ User registration & login with JWT authentication

⏳ Create time-locked capsules with unlock times

🔒 Unique unlock codes for capsule retrieval

📬 CRUD endpoints to manage capsules

📦 PostgreSQL as the data store

🐳 Easy setup with Docker for PostgreSQL

🛠️ Setup Instructions
1. Clone the repository
   bash
   Copy
   Edit
   git clone <repository>
   cd time-capsule-api
2. Start PostgreSQL using Docker
   Run the following command to start a PostgreSQL container:

bash
Copy
Edit
docker run --name postgres-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=time@2025 -e  POSTGRES_DB=time_capsule_dev -p 7654:5432 -d postgres
This will:

Run a container named postgres-db

Set the database password to time@2025

Expose PostgreSQL on port 7654

3. Create a .env file
   Create a .env file in the root of the project:

bash
Copy
Edit
touch .env
Add the following content:

env
Copy
Edit
PORT=5000
DATABASE_URL=postgres://postgres:time@2025@localhost:7654/postgres
JWT_SECRET=your_jwt_secret_here
4. Install dependencies
   bash
   Copy
   Edit
   npm install
5. Run the server
   bash
   Copy
   Edit
   npm start
   Server will be running at:
   📍 http://localhost:5000

🧪 API Endpoints
🔐 Authentication
Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Login and get JWT

📦 Capsules (Requires JWT)
Method	Endpoint	Description
POST	/capsules	Create a new capsule
GET	/capsules	List user's capsules
GET	/capsules/:id	Get a capsule by ID
PUT	/capsules/:id	Update a capsule
DELETE	/capsules/:id	Delete a capsule

Use time-capsule.postman_collection postman collections for detailed API request. This collection is available in root directory.

🧰 Tech Stack
Backend: Node.js, Express

Database: PostgreSQL (via Docker)

Auth: JWT

ORM: Sequelize (or native pg, depending on your setup)

Testing: Jest, Supertest

📌 Notes
Ensure PostgreSQL container is running before starting the server.

Change JWT_SECRET in .env for production environments.

You can connect to the database using any PostgreSQL GUI (e.g., pgAdmin) at localhost:7654.

🧹 Cleanup
To stop and remove the database container:

bash
Copy
Edit
docker stop postgres-db
docker rm postgres-db