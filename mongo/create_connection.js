const MongoClient = require('mongodb').MongoClient;

const databaseName = "CodeClash";

const credentials = require('./credentials');
const controller = require('./controller');

module.exports = {

    create_user: async function(username, email, password){

        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.create_user(username, email, password, database);
        connection.close();

        return response;
    },
    getUserById: async function(_id, res){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.getUserById(_id, res, database);
        connection.close();

        return response;
    },
    validatePassword: async function(username, password){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.validatePassword(username, password, database);
        connection.close();

        return response;
    }

}
