const shortid = require('shortid');
const Url = require('../models/url'); 


async function generateNewShortUrl(req,res){
    const body = req.body
    if(!body.url) return res.status(400).json({error: "URL is required"})
    const shortID = shortid()
    try {
        await Url.create({
            shortId: shortID,
            redirectUrl: body.url,
            visitHistory: []
        })
        return res.json({
            id: shortID,
            shortUrl: `http://localhost:8001/url/${shortID}`
        })
    } catch(err) {
        return res.status(500).json({error: "Internal Server Error"})
    }
}

async function redirectUrl(req,res){
    const shortId = req.params.shortId;
    try {
        const url = await Url.findOneAndUpdate(
            {shortId},
            {$push: {visitHistory: {timestamp: Date.now()}}}
        );
        if(!url) return res.status(404).json({error: "Short URL not found"});
        res.redirect(url.redirectUrl);
    } catch(err) {
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function handleGetAnalytics(req,res){
    const shortId = req.params.shortId;
    try {
        const result = await Url.findOne({shortId});
        if(!result) return res.status(404).json({error: "Short URL not found"});
        res.json({totalClicks: result.visitHistory.length, analytics: result.visitHistory})
    } catch(err) {
        res.status(500).json({error: "Internal Server Error"});
    }
}

module.exports = {
    generateNewShortUrl,
    redirectUrl,
    handleGetAnalytics
}