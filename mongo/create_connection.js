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

}
