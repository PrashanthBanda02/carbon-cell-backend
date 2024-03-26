// Import dependencies
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

// import middleware
const verifyToken = require('./middleware/verifyToken');

// Initialize Express app
const app = express()

// middleware to parse the JSON data
app.use(express.json())

// Connect to MongoDB cluster
mongoose.connect('mongodb+srv://Prashanth:' + encodeURIComponent('Prashanth@0509') + '@cluster0.vi6nqw1.mongodb.net/')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define routes
app.get('/', (req, res) => {
    res.send('Hello World!');
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

// end point for user registration 
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

// end point for user login

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

