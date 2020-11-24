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
    delete_user: async function(user_id, password){

        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.delete_user(user_id, password, database);
        connection.close();

        return response;
    },
    getUserById: async function(_id, res){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.getUserById(_id, database);
        connection.close();

        return response;
    },
    validatePassword: async function(username, password){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.validatePassword(username, password, database);
        connection.close();

        return response;
    },
    updateUser: async function(user_id, new_username, new_password){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.update_user(user_id, new_username, new_password, database);
        connection.close();

        return response;
    },
    getLeaderboard: async function () {
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.getLeaderboard(database);
        connection.close();

        return response;
    },
    createChallenge: async function(challengeName, creatorId, description, language, funcSignature, solution, localTests, hiddenTests){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.createChallenge(database, challengeName, creatorId, description, language, funcSignature, solution, localTests, hiddenTests);
        connection.close();

        return response;
    },
    getChallengeAttributes: async function (challengeName) {
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.getChallengeAttributes(database, challengeName);
        connection.close();

        return response;
    },
    closeChallenge: async function(creatorId, challengeName, challengeId){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.closeChallenge(database, creatorId, challengeName, challengeId);
        connection.close();
        
        return response;
    },
    getAllActiveChallenges: async function(){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.getAllActiveChallenges(database);
        connection.close();

        return response;
    },
    deleteChallenge: async function(challengeId, challengeTitle, author){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.deleteChallenge(challengeId, challengeTitle, author, database);
        connection.close();

        return response;
    },
    submitChallenge: async function(challengeId, submissionCode, writerId){
        var connection = await MongoClient.connect(credentials.getMongoUri(), { useUnifiedTopology: true }).catch((error) => console.log(error));
        var database = connection.db(databaseName);

        var response = await controller.submitChallenge(challengeId, submissionCode, writerId, database);
        connection.close();

        return response;
    },


}
