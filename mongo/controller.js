const MongoClient = require('mongodb').MongoClient;
// const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;

const credentials = require('./credentials');

const databaseName = "CodeClash";

// Required for linking javascript files
module.exports = {

    // All connections are asynchronous
    test: async function(input){

        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);
        
        response = await database.collection("users").insertOne({name: input});

        connection.close();

        // Return object ID
        return response.ops[0]._id;
    },

    getUserById: async function(_id, res) {
        // might need to check for authentication and authorization to request this user info once those features are implemented ?

        let serverError = [500, "Internal Server Error"];
        let nonExistingUserError = [404, "User with this id does not exist"];

        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        try {
            userInfo = await database.collection("users").findOne({_id: ObjectId(_id)});
        } catch (error) {
            console.log(error); 
            connection.close();
            return serverError;
         };
        

        if(userInfo == null) {
            connection.close();
            return nonExistingUserError;
        }

        let success = [200, userInfo];
        connection.close();
        return success;
    }

}