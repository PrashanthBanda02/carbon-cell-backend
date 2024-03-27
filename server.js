// Import dependencies
const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const {Web3} = require('web3');

// Import middleware
const verifyToken = require('./middleware/verifyToken');

// Initialize Express app
const app = express()

// Middleware to parse JSON data
app.use(express.json());

// Serve Swagger UI at /api-docs endpoint
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB cluster
mongoose.connect('mongodb+srv://Prashanth:' + encodeURIComponent('Prashanth@0509') + '@cluster0.vi6nqw1.mongodb.net/')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Define error handling middleware
//to handle any errors that occur during the processing of requests
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Defining the user schema
const User =  mongoose.model('User',{
    username: String,
    email: String,
    password: String
})

// API Endpoint for user registration 
app.post('/register', async (req,res)=>{
    try{
        const { username, email, password } = req.body;

        // Check if the user already exists
        const existingUser  = await User.findOne({email})
        if(existingUser ){
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password,10)

        // Create a new user with hashed password
        const newUser = new User({username,email, password: hashedPassword})

        // Save the user to the database
        await newUser.save()

        // Send success response, 200 status code-new user resource has been created
        res.status(201).json({ success: true, message: 'User registered successfully' });

    } catch(error){
        // Send error response, status code - 500 Internal Server Error
        res.status(500).json({success: false, message:'Failed to register user', error: error.message })

    }
})


// Protected route that requires authentication
// This end point is for testing purpose
app.get('/protected', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Authenticated user.' });
});

// API Endpoint for user login

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'jwt-key', { expiresIn: '1h' });

        // Send success response with token
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// logout typically involves the client-side destroying the token.

// API Endpoints for Data Retrieval

// Fetch data from the public API
async function fetchData() {
    try {
        const response = await axios.get('https://api.publicapis.org/entries');
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// API endpoint to get all data
app.get('/entries', verifyToken, async (req, res) => {
    try {
        const data = await fetchData();
        res.send(data.entries);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get filtered data 
// Example: http://localhost:3000/entries/filtered?category=Anime&limit=10

app.get('/entries/filtered', verifyToken, async (req, res) => {
    try {
        // Extract query parameters from the request URL
        const { category, limit } = req.query;
        const data = await fetchData();

        // Set default values for category and limit if they are not provided
        // if category is empty/null/undefined, it retrieves all categories by default 
        // if limit is empty/null/undefined, it limits 10 by default

        const defaultLimit = 10;
        const selectedLimit = limit || defaultLimit;

        let filteredData = data.entries; // Assuming 'data' is the variable containing the retrieved data

        // Filter based on category if provided
        if (category) {
            filteredData = filteredData.filter(entry => entry.Category.toLowerCase() === category.toLowerCase());
        }

        // Apply result limit
        filteredData = filteredData.slice(0, parseInt(selectedLimit, 10));

        res.send(filteredData);
    } catch (error) {
        console.error('Error filtering data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Task 5: Retrieve Ethereum Account Balance with web3.js

const web3 = new Web3('https://mainnet.infura.io/v3/1cfb48b3d40342db94d478bffece4e02');  // connect to an Ethereum node

app.get('/ethbalance/:address', async (req, res) => {
    try {
        const balanceWei = await web3.eth.getBalance(req.params.address);      // fetch the balance of the provided Ethereum address
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');            // Convert the balance from Wei to Ether.
        res.send({ balance: balanceEth });
    } catch (error) {
        res.status(500).send('Error fetching balance :',error);
    }
});

