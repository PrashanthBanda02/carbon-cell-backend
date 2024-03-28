# My Express API Documentation

This repository contains the documentation for the Express.js API endpoints.

## Description

This API provides endpoints for user registration, login, accessing protected routes with JWT authentication, fetching data from public APIs, and retrieving Ethereum account balances.

## Installation

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Start the server using `npm start`.

## Usage

### Endpoints

- `/register`: POST endpoint to register a new user.
- `/login`: POST endpoint for user login.
- `/protected`: GET endpoint to access protected routes with JWT authentication.
- `/entries`: GET endpoint to fetch all data.
- `/entries/filtered`: GET endpoint to fetch filtered data based on category and limit.
- `/ethbalance/{address}`: GET endpoint to retrieve Ethereum balance by address.

### Technologies Used

- Express.js
- MongoDB
- JWT for authentication
- Axios for making HTTP requests
- Bcrypt for password hashing
- Web3.js for interacting with Ethereum blockchain
- Swagger UI for API documentation

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
