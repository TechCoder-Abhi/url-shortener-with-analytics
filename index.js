require('dotenv').config();
const express = require("express");
const { connectToMongoDB } = require('./connect');
const urlRoutes = require('./routes/url');


const app = express();
app.use(express.json());
const port = process.env.PORT || 8001;

app.use('/url', urlRoutes); //middleware for url routes

connectToMongoDB(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port, () => console.log('Server is running at http://localhost:' + port));
    })
    .catch(err => {
        console.log("MongoDB connection failed:", err);
        process.exit(1);
    });