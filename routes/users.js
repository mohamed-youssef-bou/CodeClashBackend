var express = require("express");
var create_connection = require("./../mongo/create_connection");
var router = express.Router();
var validator = require("validator");

router.post("/createUser", async function (req, res) {
  // Get values from request
  var username = req.body["username"];
  var email = req.body["email"];
  var password = req.body["password"];
  //Error handling
  if (validator.isEmpty(username)) {
    return res.status(400).send("Missing username parameter");
  } else if (!validator.matches(username, "^[a-zA-Z0-9_.-]*$")) {
    return res.status(400).send("Invalid username");
  }
  if (validator.isEmpty(email)) {
    return res.status(400).send("Missing email parameter");
  } else if (!validator.isEmail(email)) {
    return res.status(400).send("Email format not valid.");
  }

  if (validator.isEmpty(password)) {
    return res.status(400).send("Missing password parameter");
  }

  var response = await create_connection.create_user(username, email, password);
  console.log(response);
  return res.status(parseInt(response[0])).send(response[1]);
});

router.post("/deleteUser", async function (req, res) {
  // Get values from request
  var user_id = req.body["user_id"];
  var password = req.body["password"];

  //Error handling
  if (validator.isEmpty(user_id)) {
    return res.status(400).send("Empty user ID");
  }

  if (validator.isEmpty(password)) {
    return res.status(400).send("Empty password");
  }

  var response = await create_connection.delete_user(user_id, password);
  return res.status(response[0]).send(response[1]);
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/:id", async function (req, res, next) {
  if (req.params.id == null) {
    res.status(400).send({ error: "_id cannot be null" });
    return;
  }

  let response = await create_connection.getUserById(req.params.id, res);
  res.status(response[0]).send(response[1]);
});

/* Update User Info */
router.put("/updateUser", async function (req, res) {
  // Get values from request
  var user_id = req.body["user_id"];
  var new_username = req.body["new_username"];
  var new_password = req.body["new_password"];

  //Error handling
  if (validator.isEmpty(user_id)) {
    return res.status(400).send("Empty user ID");
  }

  var response = await create_connection.updateUser(user_id, new_username, new_password);
  return res.status(response[0]).send(response[1]);
});

module.exports = router;
