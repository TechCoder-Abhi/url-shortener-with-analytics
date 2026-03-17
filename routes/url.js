const express = require('express');
const { generateNewShortUrl, redirectUrl, handleGetAnalytics } = require('../controllers/url');
const router = express.Router();

router.post('/', generateNewShortUrl)
router.get('/analytics/:shortId', handleGetAnalytics)
router.get('/:shortId', redirectUrl)


module.exports = router;