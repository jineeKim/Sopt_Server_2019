var express = require('express');
var router = express.Router();

router.use('/board', require('./board'));
router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));


module.exports = router;
