require('dotenv').config();
const express = require("express");
const { connectToMongoDB } = require('./connect');
const urlRoutes = require('./routes/url');
const path = require('path');


const app = express();
app.use(express.json());
const port = process.env.PORT || 8001;

// API Routes MUST come before static files
app.use('/url', urlRoutes); //middleware for url routes

// Serve static files from public folder (after API routes)
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint (Render uses this)
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

connectToMongoDB(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port, () => console.log('Server is running at http://localhost:' + port));
    })
    .catch(err => {
        console.log("MongoDB connection failed:", err);
        process.exit(1);
    });