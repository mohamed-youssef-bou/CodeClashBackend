const { InternalServerError } = require('http-errors');

const MongoClient = require('mongodb').MongoClient;
// const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

const credentials = require('./credentials');

const databaseName = "CodeClash";

const internalServerError = ["500", "Database action failed."];
const success = ["201", "Successfully created user."];
const clientDetailError = ["400", "Email or username is not unique."]

// Required for linking javascript files
module.exports = {

    test: async function (input) {
  
        var connection = await MongoClient.connect(credentials.getMongoUri(), {useUnifiedTopology: true}).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        response = await database.collection("users").insertOne({name: input});

        connection.close();

        // Return object ID
        return response.ops[0]._id;
    },

    //used for user login
    validatePassword: async function (username, passwordCandidate) {
        let connection = await MongoClient.connect(credentials.getMongoUri(), {useUnifiedTopology: true}).catch((error) => console.log(error));
        let database = connection.db(databaseName);

        const user = await database.users.findOne({name: username}).catch((error) => console.log(error));
        await connection.close();

        if (!user) {
            return [null, false];
        }

        const validate = await bcrypt.compare(passwordCandidate, user.password);

        return [user, validate];
    },

    // Creates a user in the database
    create_user: async function(username, email, password){

        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);
        var response;

        // Checking if email and password are unique
        const email_bool = await this.email_exist(database, email);
        const username_bool = await this.username_exist(database, username);

        if (email_bool || username_bool) {
            connection.close();
            return clientDetailError;
        }

        try {
            response = await database.collection("users").insertOne({
                "username" : username,
                "email" : email,
                "password" : bcrypt.hash(password, 10),
                "score" : 0,
                "challengesCreated" : "",
                "submissions": ""
            });

         } catch (e) {
            console.log(e);
            connection.close();
            return internalServerError;
         };

        connection.close();

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