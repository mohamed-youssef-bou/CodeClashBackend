var express = require("express");
var create_connection = require("./../mongo/create_connection");
var router = express.Router();
var validator = require("validator");

router.post("/createChallenge", async function (req, res) {
    // Get values from request
    var challengeName = req.body["name"];
    var creatorId = req.body["id"];
    var description = req.body["description"];
    var language = req.body["language"];
    var funcSignature = req.body["funcSignature"];
    var localTests = req.body["localTests"];
    var hiddenTests = req.body["hiddenTests"];
    var solution = req.body["solution"];

    var response = await create_connection.createChallenge(challengeName, creatorId, description,
                                                           language, funcSignature, solution, localTests, 
                                                           hiddenTests);
    return res.status(parseInt(response[0])).send(response[1]);
});

router.post("/closeChallenge", async function (req, res) {
    // Get values from request
    var creatorId = req.body["creatorId"];
    var challengeName = req.body["challengeName"];
    var challengeId = req.body["challengeId"];

    //Error handling
    if (validator.isEmpty(challengeName)) {
        return res.status(400).send("Missing challenge name parameter");
    } 

    if (validator.isEmpty(creatorId)) {
        return res.status(400).send("Missing creator id parameter");
    } 

    if (validator.isEmpty(challengeId)) {
        return res.status(400).send("Missing challenge id parameter");
    }   

    var response = await create_connection.closeChallenge(creatorId, challengeName, challengeId);
    return res.status(parseInt(response[0])).send(response[1]);
});

router.post("/deleteChallenge", async function (req, res) {

     var challengeId = req.body["challengeId"];
     var challengeTitle = req.body["challengeName"];
     var author = req.body["author"];

     //Error handling
    if (validator.isEmpty(challengeId)) {
        return res.status(400).send("Challenge does not exist.");
    } 

    if (validator.isEmpty(challengeTitle)) {
        return res.status(400).send("Challenge name is empty.");
    } 

    if (validator.isEmpty(author)) {
        return res.status(400).send("Missing author parameter.");
    } 

    var response = await create_connection.deleteChallenge(challengeId, challengeTitle, author);
    return res.status(parseInt(response[0])).send(response[1]);

});

/* GET challenges listing. */
router.get("/challenges", async function (req, res) {
    let response = await create_connection.getAllActiveChallenges();
    return res.send(response);
});

module.exports = router;