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
        
        if(_id == null) {
            res.status(400).send({ error: "_id cannot be null"});
            db.close();
            return;
        }

        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        userInfo = await database.collection("users").findOne({_id: ObjectId(_id)}).catch((error) => console.log(error)); 

        if(userInfo == null) {
            res.status(404).send({ error: "User with this id does not exist" });
            db.close();
            return;
        }

        res.send(userInfo);
        db.close();
        return;
    }

}