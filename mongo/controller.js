const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const validator = require("validator");

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
const challengeDescriptionMissing = ["400", "Missing challenge description parameter"];
const challengeMissingFuncSig = ["400", "Missing function signature parameter"];
const challengeMissingImplementation = ["400", "Missing implementation parameter"];
const challengeMissingLocalTests = ["400", "Missing local test cases parameter"];
const challengeInvalidLocalTests = ["400", "Local tests provided are not valid"];
const challengeMissingHiddenTests = ["400", "Missing hidden test cases parameter"];
const challengeInvalidHiddenTests = ["400", "Hidden tests provided are not valid"];

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
                "challengesCreated": "",
                "submissions": ""
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

    // Checks if challenge name already taken
    challengeNameExists: async function (database, challengeName) {
        const exists = await database.collection("challenges").findOne({
            challengeName: {$eq: challengeName}
        });

        return exists != null;
    },

    // Creates a challenge
    createChallenge: async function (database, challengeName, creatorId, description, funcSignature, solution, localTests, hiddenTests) {
        if (validator.isEmpty(challengeName.trim())) {
            return challengeMissingName;
        }

        if (await this.challengeNameExists(challengeName)) {
            return challengeNameExists;
        }

        if (validator.isEmpty(creatorId.trim())) {
            return challengeMissingCreatorID;
        }

        if (await database.collection("users").findOne({"_id": ObjectId(creatorId)}) == null) {
            return nonExistingUserError;
        }

        if (validator.isEmpty(description.trim())) {
            return challengeDescriptionMissing;
        }

        if (validator.isEmpty(funcSignature.trim())) {
            return challengeMissingFuncSig;
        }

        if (validator.isEmpty(solution.trim())) {
            return challengeMissingImplementation;
        }

        if (validator.isEmpty(localTests)) {
            return challengeMissingLocalTests;
        }

        if (validator.isJSON(localTests)) {
            return challengeInvalidLocalTests;
        }

        if (validator.isEmpty(hiddenTests)) {
            return challengeMissingHiddenTests;
        }

        if (validator.isJSON(hiddenTests)) {
            return challengeInvalidHiddenTests;
        }

        try {
            const response = await database.collection("challenges").insertOne({
                "challengeName": challengeName,
                "creatorId": creatorId,
                "description": description,
                "functionSignature": funcSignature,
                "localTests": JSON.parse(localTests),
                "hiddenTests": JSON.parse(hiddenTests),
                "solution": solution,
                "dateCreated": new Date(),
                "dateClosed": null,
            });

            return ["201", "Successfully created the challenge. Challenge ID: " + response["insertedId"]]

        } catch (e) {
            console.log(e);
            return internalServerError;
        }
    },

    getAllActiveChallenges: async function (database) {
        return await database.collection("challenges").find({dateClosed: null}).toArray();
    }
}