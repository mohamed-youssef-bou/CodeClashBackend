var express = require("express");
var create_connection = require("../mongo/create_connection");
var router = express.Router();
var validator = require("validator");

router.post("/submitChallenge", async function (req, res) {
    var challengeId = req.body["challengeId"];
    var submissionCode = req.body["submissionCode"];
    var writerId = req.body["writerId"];

    var response = await create_connection.submitChallenge(challengeId, submissionCode, writerId);

    return res.status(parseInt(response[0])).send(response[1]);
});

module.exports = router;