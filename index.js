// Import dependencies
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

// Initialize Express app
const app = express()

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