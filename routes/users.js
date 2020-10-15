var express = require('express');
var router = express.Router();

const { getUserById } = require('../mongo/controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', async function(req, res, next) {
  if(req.params.id == null) {
      res.status(400).send({ error: "_id cannot be null"});
      return;
  }

  let response = await getUserById(req.params.id, res);
  res.status(response[0]).send(response[1]);
});

module.exports = router;
