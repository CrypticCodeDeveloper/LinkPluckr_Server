var express = require('express');
var router = express.Router();
const {getPlatformLinkInfo} = require('../controllers/mediaInfoController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Snap Saver API' });
});

router.post('/media/info', getPlatformLinkInfo)

module.exports = router;
