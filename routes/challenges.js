var express = require("express");
var create_connection = require("./../mongo/create_connection");
var router = express.Router();
var validator = require("validator");


/* GET users listing. */
router.get("/challenges", function (req, res, next) {
  let response = await create_connection.getAllActiveChallenges();
  res.status(200).send(response);
});


module.exports = router;