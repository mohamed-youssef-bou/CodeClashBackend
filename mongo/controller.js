const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

const internalServerError = ["500", "Database action failed."];
const success = ["201", "Successfully created user."];
const clientDetailError = ["400", "Email or username is not unique."]


// Required for linking javascript files
module.exports = {

    getUserById: async function(_id, res, database) {
        // might need to check for authentication and authorization to request this user info once those features are implemented ?

        let serverError = [500, "Internal Server Error"];
        let nonExistingUserError = [404, "User with this id does not exist"];

        try {
            userInfo = await database.collection("users").findOne({_id: ObjectId(_id)});
        } catch (error) {
            console.log(error); 
            return serverError;
         };

        if(userInfo == null) {
            return nonExistingUserError;
        }

        let success = [200, userInfo];
        return success;
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
    create_user: async function(username, email, password, database){

        var response;

        // Checking if email and password are unique
        const email_bool = await this.email_exist(database, email);
        const username_bool = await this.username_exist(database, username);

        if (email_bool || username_bool) {
            return clientDetailError;
        }

        try {
            response = await database.collection("users").insertOne({
                "username" : username,
                "email" : email,
                "password" : await bcrypt.hash(password, 10),
                "score" : 0,
                "challengesCreated" : "",
                "submissions": ""
            });

         } catch (e) {
            console.log(e);
            return internalServerError;
         };

        return success;
    },

    // Checks if email already exists
    email_exist: async function(database, email) {

        var check = await database.collection("users").findOne({
            email: {$eq: email}
        }); 

        if(check == null) {
            return false;
        }

        return true;
        
    },

    // Checks if username already exists
    username_exist: async function(database, username) {

        var check = await database.collection("users").findOne({
            username: {$eq: username}
        }); 

        if(check == null) {
            return false;
        }

        return true;
        
    },
}