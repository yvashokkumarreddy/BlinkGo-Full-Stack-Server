GroZaar Backend

GroZaar is a full-featured backend API for a modern grocery e-commerce platform. It provides endpoints for user authentication, product and category management, orders, and real-time updates for the frontend application.

Table of Contents

Features

Tech Stack

Installation

Environment Variables

Running the Project

API Endpoints

Contributing

License

Features

User authentication with secure password hashing

CRUD operations for products, categories, and subcategories

Order placement and management

Integration with payment gateways

Real-time updates for stock and order status

Email and notification support for order confirmations

Compatible with GroZaar frontend application

Tech Stack

Node.js – Runtime environment

Express.js – Backend framework

MongoDB – Database

Mongoose – MongoDB ODM

Axios – HTTP client

Nodemailer – Email notifications

JWT – Authentication

Vercel / Render – Deployment

Installation

Clone the repository:

git clone https://github.com/yvashokkumarreddy/Grozaar-Full-Stack-Server.git


Navigate to the project directory:

cd grozaar-backend


Install dependencies:

npm install

Environment Variables

Create a .env file in the root directory with the following:

PORT=6502

MONGO_URI=<your_mongodb_connection_string>

JWT_SECRET=<your_jwt_secret>

EMAIL_HOST=<smtp_host>

EMAIL_PORT=<smtp_port>

EMAIL_USER=<email_address>

EMAIL_PASS=<email_password>


Replace <...> with your actual credentials.

Running the Project

Development Mode:

npm run dev


Production Mode:

npm start

API Endpoints 
User Routes

POST /user/signup – Register new user

POST /user/login – Login user

GET /user/:id – Get user details

Category Routes

GET /category – Fetch all categories

POST /category – Add new category

Subcategory Routes

GET /subcategory – Fetch all subcategories

POST /subcategory – Add new subcategory

Product Routes

GET /product – Fetch all products

POST /product – Add new product

PUT /product/:id – Update product

DELETE /product/:id – Delete product

Order Routes

POST /order – Place new order

GET /order/:id – Get order details

PUT /order/:id – Update order status

For complete API documentation, see API Docs
 (optional)

Contributing

Contributions are welcome! Please follow these steps:

Fork the repository

Create a new branch (git checkout -b feature/YourFeature)

Commit your changes (git commit -m "Add new feature")

Push to your branch (git push origin feature/YourFeature)

Open a Pull Request

License

This project is licensed under the MIT License
