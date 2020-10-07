const aws = require('aws-sdk');

module.exports = {

    // For credential security, store cred in mongodb
    // getMongoUri: function(){
    //     var mongoKey = new aws.S3({mongodb_uri: process.env.mongodb_uri,});
    //     return mongoKey.config.mongodb_uri;
    // }

    getMongoUri: function(){
        return "***REMOVED***";
    }

}