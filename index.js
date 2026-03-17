require('dotenv').config();
const express = require("express");
const { connectToMongoDB } = require('./connect');
const urlRoutes = require('./routes/url');
const Url = require('./models/url');


const app = express();
app.use(express.json());
const port = process.env.PORT || 8001;

connectToMongoDB(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.log("MongoDB connection failed:", err);
});

app.use('/url', urlRoutes); //middleware for url routes

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    try {
        const url = await Url.findOneAndUpdate({
            shortId,
        }, {
            $push: { visitHistory: { timestamp: Date.now() } }
        });
        if (!url) return res.status(404).json({ error: "Short URL not found" });
        res.redirect(url.redirectUrl);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
})


app.listen(port, () => console.log('Server is running at http://localhost:' + port));