var bcrypt = require('bcrypt');
const { InternalServerError } = require('http-errors');

const MongoClient = require('mongodb').MongoClient;
// const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;

const credentials = require('./credentials');

const databaseName = "CodeClash";

// Required for linking javascript files
module.exports = {

    create_user: async function(userName, userEmail, password){

        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);
        var response;
        var internalServerError = "500";
        var success = "201";

        try {
            response = await database.collection("users").insertOne({
                "username" : userName,
                "userEmail" : userEmail,
                "password" : bcrypt.hash(password, 10),
                "score" : 0,
                "challengesCreated" : "",
                "submissions": ""
            });

         } catch (e) {
            console.log(e);
            return internalServerError;
         };

        connection.close();

        return success;
    },

}