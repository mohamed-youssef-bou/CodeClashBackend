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

        const defaultTest = 
        
        await database.collection("users").insertOne({test: input});

        connection.close();
        return "Success";
    },

}