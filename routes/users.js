var express = require('express');
var controller = require('./../mongo/controller');
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
  
  var response = await controller.create_user(username, email, password);
  return res.status(response[0]).send(response[1]);

});

module.exports = router;
