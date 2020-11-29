const aws = require('aws-sdk');

module.exports = {

    // For credential security, store cred in mongodb
    // getMongoUri: function(){
    //     var mongoKey = new aws.S3({mongodb_uri: process.env.mongodb_uri,});
    //     return mongoKey.config.mongodb_uri;
    // }

    getMongoUri: function(){
        return "mongodb+srv://Codeclash:Codeclash19!@cluster0.95u1y.azure.mongodb.net/CodeClash?retryWrites=true&w=majority";
    }

}