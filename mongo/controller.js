const MongoClient = require('mongodb').MongoClient;
// const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

const credentials = require('./credentials');

const databaseName = "CodeClash";

// Required for linking javascript files
module.exports = {

    // All connections are asynchronous
    test: async function (input) {

        var connection = await MongoClient.connect(credentials.getMongoUri(), {useUnifiedTopology: true}).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        response = await database.collection("users").insertOne({name: input});

        connection.close();

        // Return object ID
        return response.ops[0]._id;
    },

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
    }
}