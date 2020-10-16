const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

const creationSuccess = ["201", "Successfully created user."];
const deletionSuccess = ["201", "Successfully deleted user."];
const internalServerError = ["500", "Database action failed."];
const clientDetailError = ["400", "Email or username is not unique."]
const nonExistingUserError = ["404", "User with this id does not exist."];
const usernameError = ["404", "User with this id does not exist"];  
const passwordError = ["401", "Password provided is incorrect."];  



// Required for linking javascript files
module.exports = {

    getUserById: async function(_id, database) {
        // might need to check for authentication and authorization to request this user info once those features are implemented ?

        let serverError = ["500", "Internal Server Error"];

        try {
            userInfo = await database.collection("users").findOne({"_id": ObjectId(_id)});
        } catch (error) {
            console.log(error); 
            return serverError;
         };

        if (userInfo == null) {
            return nonExistingUserError;
        }

        let creationSuccess = ["200", userInfo];
        return creationSuccess;
    },

    getUserByUsername: async function(username, database) {
        var user = await database.collection("users").findOne({
            username: {$eq: username}
        }); 

        if (user == null) return usernameError; 

        return user
    },

    //used for user login
    validatePassword: async function (username, passwordCandidate, database) {

        const user = await database.users.findOne({name: username}).catch((error) => console.log(error));
        await connection.close();

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

        return creationSuccess;
    },

    // Deletes a user in the database
    delete_user: async function(user_id, password, database){ 
        var response;

        // Checking if account exists
        var user = await this.getUserById(user_id, database);     
        if (user[0] != "200") return nonExistingUserError; 
        var user_info = user[1]

        // Checking if password is valid
        var pass_check =  bcrypt.compareSync(password, user_info["password"]);
        if (!pass_check) return passwordError; 
        
        // Removing user
        try {
            response = await database.collection("users").remove({_id: ObjectId(user_id)});
         } catch (e) {
            console.log(e);
            return internalServerError;
         };

        return deletionSuccess;
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