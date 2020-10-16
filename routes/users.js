var express = require('express');
var create_connection = require('./../mongo/create_connection');
var router = express.Router();
var validator = require("validator");

router.post('/', async function(req, res) {
  // Get values from request
  var username = req.headers['username'];
  var email = req.headers['email'];
  var password = req.headers['password'];

  //Error handling
  if (validator.isEmpty(username)) {
    return res.status(400).send('Empty username');
  } 
  else if (!validator.matches(username, '^[a-zA-Z0-9_.-]*$')) {
    return res.status(400).send('Invalid username');
  } 

  if (!validator.isEmail(email)) {
    return res.status(400).send('Invalid email address');
  }

  if (validator.isEmpty(password)) {
    return res.status(400).send('Empty password');
  } 
  
  var response = await create_connection.create_user(username, email, password);
  return res.status(response[0]).send(response[1]);
});

router.post('/deleteUser', async function(req, res) {
  // Get values from request
  var user_id = req.headers['user_id'];
  var password = req.headers['password'];

  //Error handling
  if (validator.isEmpty(user_id)) {
    return res.status(400).send('Empty user ID');
  } 

  if (validator.isEmpty(password)) {
    return res.status(400).send('Empty password');
  } 
  
  var response = await create_connection.delete_user(user_id, password);
  return res.status(response[0]).send(response[1]);
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', async function(req, res, next) {
  if(req.params.id == null) {
      res.status(400).send({ error: "_id cannot be null"});
      return;
  }

  let response = await create_connection.getUserById(req.params.id, res);
  res.status(response[0]).send(response[1]);
  
});

module.exports = router;
