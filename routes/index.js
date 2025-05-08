const express = require('express');
const router = express.Router();
const { getPlatformLinkInfo } = require('../controllers/mediaInfoController');

/**
 * @route GET /
 * @description Home page route
 * @access Public
 */
router.get('/', (req, res) => {
  res.render('index', { title: 'Snap Saver API' });
});

/**
 * @route POST /media/info
 * @description Get media information from various platforms
 * @access Public
 */
router.post('/media/info', getPlatformLinkInfo);

module.exports = router;
