const shortid = require('shortid');
const Url = require('../models/url'); 

function buildPublicShortUrl(req, shortId) {
    return `${req.protocol}://${req.get('host')}/url/${shortId}`;
}

function normalizeAndValidateUrl(inputUrl) {
    if (!inputUrl || typeof inputUrl !== 'string') {
        return null;
    }

    const trimmed = inputUrl.trim();
    if (!trimmed) {
        return null;
    }

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(withProtocol);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return null;
        }
        return parsed.toString();
    } catch {
        return null;
    }
}

function isValidCustomAlias(alias) {
    return /^[a-zA-Z0-9_-]{4,30}$/.test(alias);
}

function toIST(dateInput) {
    if (!dateInput) return null;

    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

async function generateUniqueShortId(maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
        const candidate = shortid();
        const exists = await Url.exists({ shortId: candidate });
        if (!exists) {
            return candidate;
        }
    }

    throw new Error('Unable to generate unique short ID');
}


async function generateNewShortUrl(req,res){
    const body = req.body || {};
    const normalizedUrl = normalizeAndValidateUrl(body.url);

    if (!normalizedUrl) {
        return res.status(400).json({ error: "A valid URL is required" });
    }

    try {
        let shortID;

        if (body.customAlias) {
            if (!isValidCustomAlias(body.customAlias)) {
                return res.status(400).json({
                    error: "customAlias must be 4-30 chars and use only letters, numbers, _ or -"
                });
            }

            const alreadyExists = await Url.exists({ shortId: body.customAlias });
            if (alreadyExists) {
                return res.status(409).json({ error: "customAlias is already in use" });
            }

            shortID = body.customAlias;
        } else {
            shortID = await generateUniqueShortId();
        }

        await Url.create({
            shortId: shortID,
            redirectUrl: normalizedUrl,
            visitHistory: []
        });

        return res.status(201).json({
            id: shortID,
            shortUrl: buildPublicShortUrl(req, shortID)
        });
    } catch(err) {
        return res.status(500).json({error: "Internal Server Error"});
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

        const analyticsInIST = result.visitHistory.map((visit) => ({
            ...visit.toObject(),
            timestampIST: toIST(visit.timestamp)
        }));

        res.json({
            totalClicks: result.visitHistory.length,
            analytics: analyticsInIST,
            timezone: 'Asia/Kolkata'
        });
    } catch(err) {
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function handleGetUrlMeta(req, res) {
    const shortId = req.params.shortId;
    try {
        const result = await Url.findOne({ shortId });
        if (!result) return res.status(404).json({ error: "Short URL not found" });

        return res.json({
            id: result.shortId,
            redirectUrl: result.redirectUrl,
            shortUrl: buildPublicShortUrl(req, result.shortId),
            createdAt: result.createdAt,
            createdAtIST: toIST(result.createdAt),
            updatedAt: result.updatedAt,
            updatedAtIST: toIST(result.updatedAt),
            timezone: 'Asia/Kolkata',
            totalClicks: result.visitHistory.length
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    generateNewShortUrl,
    redirectUrl,
    handleGetAnalytics,
    handleGetUrlMeta
};