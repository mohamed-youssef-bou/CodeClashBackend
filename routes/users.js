var express = require('express');
var router = express.Router();

const { getUserById } = require('../mongo/controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', function(req, res, next) {
  getUserById(req.params.id, res);
});

module.exports = router;
