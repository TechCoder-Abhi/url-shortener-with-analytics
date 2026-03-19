const express = require('express');
const { generateNewShortUrl, redirectUrl, handleGetAnalytics, handleGetUrlMeta } = require('../controllers/url');
const router = express.Router();

router.post('/', generateNewShortUrl);
router.get('/analytics/:shortId', handleGetAnalytics);
router.get('/meta/:shortId', handleGetUrlMeta);
router.get('/:shortId', redirectUrl);


module.exports = router;