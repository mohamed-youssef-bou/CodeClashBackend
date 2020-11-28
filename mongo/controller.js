const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const validator = require("validator");
const {node} = require('compile-run');
const { execFile } = require('child_process');
const fs = require('fs');
const util = require('util');

const creationSuccess = ["201", "Successfully created user."];
const deletionSuccess = ["201", "Successfully deleted user."];
const updateSuccess = ["201", "Successfully updated user."];
const internalServerError = ["500", "Database action failed."];
const clientDetailErrorUser = ["400", "Username is not unique."]
const clientDetailErrorEmail = ["400", "Email is not unique."]
const nonExistingUserError = ["404", "User with this id does not exist."];
const usernameError = ["404", "User with this username does not exist"];
const passwordError = ["401", "Password provided is incorrect."];
const passwordFormatError = ["400", "Password format not valid."];
const blankInputError = ["400", "Input parameters were blank"];

const challengeMissingName = ["400", "Missing challenge name parameter"];
const challengeNameExists = ["400", "Challenge name is not unique"];
const challengeMissingCreatorID = ["400", "Missing creator id parameter"];
const challengeMissingDescription = ["400", "Missing challenge description parameter"];
const challengeMissingLanguage = ["400", "Missing challenge language parameter"];
const challengeMissingFuncSig = ["400", "Missing function signature parameter"];
const challengeMissingImplementation = ["400", "Missing implementation parameter"];
const challengeMissingLocalTests = ["400", "Missing local test cases parameter"];
const challengeInvalidLocalTests = ["400", "Provided local tests are not valid"];
const challengeMissingHiddenTests = ["400", "Missing hidden test cases parameter"];
const challengeInvalidHiddenTests = ["400", "Provided hidden tests are not valid"];
const challengeDoesNotExist = ["400", "Challenge does not exist"];
const challengeAlreadyClosed = ["400", "Challenge already closed!"];
const challengeCannotAttempt = ["400", "Challenge can no longer be solved"];
const challengeCloserIdMatchError = ["400", "Closer ID does not match creator ID."];
const challengeIncorrectAuthor = ["400", "Incorrect author."];
const nonExistingChallenge = ["404", "Challenge doesn't exist."];
const testingError = ["404", "Testing error"];

// Required for linking javascript files
module.exports = {

    getUserById: async function (_id, database) {
        // might need to check for authentication and authorization to request this user info once those features are implemented ?

        let serverError = ["500", "Internal Server Error"];

        try {
            userInfo = await database.collection("users").findOne({"_id": ObjectId(_id)});
        } catch (error) {
            //console.log(error);
            return serverError;
        }

        if (userInfo == null) {
            return nonExistingUserError;
        }

        let creationSuccess = ["200", userInfo];
        return creationSuccess;
    },

    getUserByUsername: async function (username, database) {
        var user = await database.collection("users").findOne({
            username: {$eq: username}
        });

        if (user == null) return usernameError;

        return user
    },

    getChallengeById: async function (_id, database) {
        let serverError = ["500", "Internal Server Error"];

        try {
            challengeInfo = await database.collection("challenges").findOne({"_id": ObjectId(_id)});
        } catch (error) {
            return serverError;
        }

        if (challengeInfo == null) {
            return challengeDoesNotExist;
        }

        let creationSuccess = ["200", challengeInfo];
        return creationSuccess;
    },

    getChallengeByName: async function (challengeName, database) {
        var challenge = await database.collection("challenges").findOne({
            challengeName: {$eq: challengeName}
        });

        if (challenge == null) return challengeDoesNotExist;

        return challenge
    },

    //used for user login
    validatePassword: async function (username, passwordCandidate, database) {

        const user = await database.collection("users").findOne({username: username}).catch((error) => console.log(error));

        if (!user) {
            return [null, false];
        }

        const validate = await bcrypt.compare(passwordCandidate, user.password);

        return [user, validate];
    },

    // Creates a user in the database
    create_user: async function (username, email, password, database) {

        var response;

        // Checking if email and password are unique
        const email_bool = await this.email_exist(database, email);
        const username_bool = await this.username_exist(database, username);

        if (email_bool) {
            return clientDetailErrorEmail;
        }

        if (username_bool) {
            return clientDetailErrorUser;
        }

        if (password.length <= 1) {
            return passwordFormatError;
        }

        try {
            response = await database.collection("users").insertOne({
                "username": username,
                "email": email,
                "password": await bcrypt.hash(password, 10),
                "score": 0,
                "challengesCreated": [],
                "submissions": []
            });

        } catch (e) {
            console.log(e);
            return internalServerError;
        }

        return creationSuccess;
    },

    // Deletes a user in the database
    delete_user: async function (user_id, password, database) {
        var response;

        // Checking if account exists
        var user = await this.getUserById(user_id, database);
        if (user[0] != "200") return nonExistingUserError;
        var user_info = user[1]

        // Checking if password is valid
        var pass_check = bcrypt.compareSync(password, user_info["password"]);
        if (!pass_check) return passwordError;

        // Removing user
        try {
            response = await database.collection("users").deleteOne({_id: ObjectId(user_id)});
        } catch (e) {
            console.log(e);
            return internalServerError;
        }
        ;

        return deletionSuccess;
    },

    // Updates a user in the database
    update_user: async function (user_id, new_username, new_password, database) {
        var response;

        // Checking if account exists
        var user = await this.getUserById(user_id, database);
        if (user[0] != "200") return nonExistingUserError;

        if (new_password.length == 0 && new_username.length == 0) return blankInputError
        else if (new_password.length == 0) {
            const username_bool = await this.username_exist(database, new_username);
            if (username_bool) return clientDetailError;
            // Updating user
            try {
                await database.collection("users").updateOne(
                    {"_id": ObjectId(user_id)},
                    {
                        $set: {
                            "username": new_username,
                        },
                        $currentDate: {lastModified: true}
                    }
                )
                return updateSuccess;
            } catch (e) {
                console.log(e);
                return internalServerError;
            }
            ;
        }


        // Checking if new password is valid
        if (new_password.length == 1) return passwordFormatError;

        // Checking if new username is valid
        if (new_username.length > 0) {
            const username_bool = await this.username_exist(database, new_username);
            if (username_bool) return clientDetailErrorUser;
        } else {
            new_username = user[1].username;
        }

        // Updating user
        try {
            await database.collection("users").updateOne(
                {"_id": ObjectId(user_id)},
                {
                    $set: {
                        "username": new_username,
                        "password": await bcrypt.hash(new_password, 10)
                    },
                    $currentDate: {lastModified: true}
                }
            )
        } catch (e) {
            console.log(e);
            return internalServerError;
        }
        ;

        return updateSuccess;
    },

    // Checks if email already exists
    email_exist: async function (database, email) {

        var check = await database.collection("users").findOne({
            email: {$eq: email}
        });

        if (check == null) {
            return false;
        }

        return true;

    },

    // Checks if username already exists
    username_exist: async function (database, username) {

        var check = await database.collection("users").findOne({
            username: {$eq: username}
        });

        if (check == null) {
            return false;
        }

        return true;

    },

    // Gets list of users ordered by their score (leaderboard)
    getLeaderboard: async function (database) {
        const Comparator = (a, b) => {
            //compare scores first
            if (a["score"] > b["score"]) return -1;
            if (a["score"] < b["score"]) return 1;
            //if scores are the same, sort usernames alphabetically
            if (a["username"] < b["username"]) return -1;
            if (a["username"] > b["username"]) return 1;
            return 0;
        }

        const options = {
            // Include only the `username` and `score` fields in each returned document
            projection: {_id: 0, username: 1, score: 1},
        };
        let activeUsers = await database.collection("users").find({}, options).toArray();

        return activeUsers.sort(Comparator);
    },

    // Checks if challenge name already taken
    challengeNameExists: async function (database, challengeName) {
        const exists = await database.collection("challenges").findOne({
            challengeName: {$eq: challengeName}
        });

        return exists != null;
    },

    // Creates a challenge
    createChallenge: async function (database, challengeName, creatorId, description, language, funcSignature, solution, localTests, hiddenTests) {
        if (challengeName === null || challengeName.trim() === "") {
            return challengeMissingName;
        }

        if (await this.challengeNameExists(database, challengeName)) {
            return challengeNameExists;
        }

        if (creatorId === null || creatorId.trim() === "") {
            return challengeMissingCreatorID;
        }

        if (creatorId.length !== 24 || await database.collection("users").findOne({"_id": ObjectId(creatorId)}) == null) {
            return nonExistingUserError;
        }

        if (description === null || description.trim() === "") {
            return challengeMissingDescription;
        }

        if (language === null || language.trim() === "") {
            return challengeMissingLanguage;
        }

        if (funcSignature === null || funcSignature.trim() === "") {
            return challengeMissingFuncSig;
        }

        if (solution === null || solution.trim() === "") {
            return challengeMissingImplementation;
        }

        if (localTests === null || localTests.trim() === "") {
            return challengeMissingLocalTests;
        }

        if (!validator.isJSON(localTests)) {
            return challengeInvalidLocalTests;
        }

        if (hiddenTests === null || hiddenTests.trim() === "") {
            return challengeMissingHiddenTests;
        }

        if (!validator.isJSON(hiddenTests)) {
            return challengeInvalidHiddenTests;
        }

        try {
            const response = await database.collection("challenges").insertOne({
                "challengeName": challengeName,
                "creatorId": creatorId,
                "description": description,
                "language": language,
                "functionSignature": funcSignature,
                "localTests": JSON.parse(localTests),
                "hiddenTests": JSON.parse(hiddenTests),
                "solution": solution,
                "dateCreated": new Date(),
                "dateClosed": null,
            });

            var user = await database.collection("users").findOne({_id: ObjectId(creatorId)});

            var challengeId = response.ops[0]._id;
            var newChallengeList = user.challengesCreated;

            newChallengeList.push(challengeId);
            
            // Save challenge to the author's list
            await database.collection("users").updateOne(
                {"_id": ObjectId(creatorId)},
                {
                    $set: {
                        "challengesCreated": newChallengeList
                    }
                }
            )

            return ["201", "Successfully created the challenge"]

        } catch (e) {
            console.log(e);
            return internalServerError;
        }
    },

    // Queries challenge attributes
    getChallengeAttributes: async function (database, challengeName) {
        if (challengeName === null || challengeName.trim() === "") {
            return challengeMissingName;
        }

        const requestedChallenge = await database.collection("challenges").findOne({
            challengeName: {$eq: challengeName}
        })

        if (requestedChallenge == null) {
            return challengeDoesNotExist;
        }

        if (requestedChallenge.dateClosed != null) {
            return challengeCannotAttempt;
        }

        let author;
        let authorFound = await this.getUserById(requestedChallenge.creatorId, database);
        if (parseInt(authorFound[0]) !== 200) {
            return authorFound;
        } else {
            author = authorFound[1];
        }

        let attributes = [challengeName, author.username, requestedChallenge.description, requestedChallenge.language,
            requestedChallenge.functionSignature, requestedChallenge.localTests, requestedChallenge._id];

        return ["200", attributes];
    },

    // Closes a challenge
    closeChallenge: async function (database, creatorId, challengeName, challengeId) {
        // Error check 
        if (validator.isEmpty(challengeName.trim())) return challengeMissingName;
        
        if (!(await this.challengeNameExists(database, challengeName))) return challengeDoesNotExist;
        
        if (validator.isEmpty(creatorId.trim())) return challengeMissingCreatorID;
        
        if (await database.collection("users").findOne({"_id": ObjectId(creatorId)}) == null) 
            return nonExistingUserError;
         
        // Grab challenge info
        challengeInfo = await this.getChallengeById(challengeId, database);
        if (challengeInfo[0] == "200") challengeInfo = challengeInfo[1];
        else return challengeInfo[1];
        
        // Check if closer Id matches Creator id
        if (challengeInfo.creatorId != creatorId) return challengeCloserIdMatchError;

        // Check if challenge has been closed already
        dateClosed = challengeInfo.dateClosed; 
        if (dateClosed != null) return challengeAlreadyClosed;
        // Close challenge
        try {
            await database.collection("challenges").updateOne(
                {"_id": ObjectId(challengeId)},
                {
                    $set: {
                        "dateClosed": new Date(),
                    },
                    $currentDate: {lastModified: true}
                }
            )
            return ["201", "Successfully closed the challenge"]

        } catch (e) {
            console.log(e);
            return internalServerError;
        }
    },


    getAllActiveChallenges: async function (database) {
        return await database.collection("challenges").find().toArray();
    },

    // Deletes a user in the database
    deleteChallenge: async function (challengeId, challengeTitle, author, database) {

        // Checking if account exists
        var challenge = await database.collection("challenges").findOne({_id: ObjectId(challengeId), challengeName: challengeTitle});
        if(challenge == null) {
            return nonExistingChallenge;
        }

        var user = await this.getUserById(challenge.creatorId, database);

        if(user == null) {
            return nonExistingUserError;
        }

        // Check to make sure the author is deleting the challenge.
        if(user[1].username.toLowerCase() != author.toLowerCase()){
            return challengeIncorrectAuthor;
        }

        try {
            response = await database.collection("challenges").deleteOne({_id: ObjectId(challengeId)});
        } catch (e) {
            console.log(e);
            return internalServerError;
        }

        return [200, 'Successfully deleted challenge.'];
    },

    submitChallenge: async function (challengeId, submissionCode, writerId, database){

        var score = 0;

        // Get challenge from db
        var challenge = await database.collection("challenges").findOne({_id: ObjectId(challengeId)});

        if(challenge == null){
            return nonExistingChallenge;
        }

        var user = await database.collection("users").findOne({_id: ObjectId(writerId)});

        if(user == null){
            return nonExistingUserError;
        }

        var result = await this.compileAndTestChallenge(submissionCode, challenge);

        const response = await database.collection("submission").insertOne({
            "challengeId": challenge._id,
            "writerId": writerId,
            "score": result[0],
            "submissionCode": submissionCode,
            "completionTime": new Date(),
        });

        var submissionId = response.ops[0]._id;
        var newSubmissionList = user.submissions;

        newSubmissionList.push(submissionId);
        
        // Save submissionId in user list
        await database.collection("users").updateOne(
            {"_id": ObjectId(writerId)},
            {
                $set: {
                    "submissions": newSubmissionList,
                    "score": result[0] + user.score
                }
            }
        )

        return ["200", result]
    },

    compileAndTestChallenge: async function (submissionCode, challenge){

        var functionSignature = submissionCode.split("(")[0].split(" ")[1];

        var inputLocalArray = JSON.parse(challenge.localTests.input);
        var outputLocalArray = JSON.parse(challenge.localTests.output);

        var inputHiddenArray = JSON.parse(challenge.hiddenTests.input);
        var outputHiddenArray = JSON.parse(challenge.hiddenTests.output);

        var allInputs = inputLocalArray.concat(inputHiddenArray);
        var allOutputs = outputLocalArray.concat(outputHiddenArray);

        var count = 0;

        // Looping through all the tests 
        for (var i = 0; i < allInputs.length; i++) {
            
            let input = allInputs[i].toString();
            let output = allOutputs[i].toString();

            let main = "(function(){console.log(" + functionSignature + "(" + input +"));})(); "; 
            let sourceCode = main + submissionCode;

            let sourcePromise = await node.runSource(sourceCode).catch(err => {console.log(err)});

            if(sourcePromise.stdout === output + "\n" || sourcePromise.stdout === output){
                count++;
            }
        }

        var totalScore = allInputs.length;
        var score = Math.round(10000 * (count / totalScore)) / 100;

        // Score, tests passed
        return [score, count];
        
    }

}