const MongoClient = require('mongodb').MongoClient;
const credentials = require('../mongo/credentials');
const controller = require('../mongo/controller');
var bcrypt = require('bcrypt');

let databaseName = "CodeClash";
let username_1 = "KimTastic";
let username_2 = "KimTasticP"
let password = "strongPassword";
let email_1 = "this.is@goodemail.yes";
let email_2 = "this.is@goodemail2.yes"

describe('Insert Success', () => {
    let connection;
    let database;
    let users;
    let generated_id;
  
    beforeAll(async () => {
      connection = await MongoClient.connect(credentials.getMongoUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      database = connection.db(databaseName);
      users = database.collection('users');
    });
  
    afterAll(async () => {
      await users.deleteOne({_id: generated_id});
      await connection.close();
    });
  
    it('Successfully inserts a user into mongodb', async () => {

      await controller.create_user(username_1, email_1, password);
      response = await users.findOne({username: username_1});

      generated_id = response._id;

      expect(response.username).toEqual(username_1);
      expect(response.email).toEqual(email_1);
      expect(response.score).toEqual(0);
      expect(response.challengesCreated).toEqual('');
      expect(response.submissions).toEqual('');

    });
  });

  describe('Insert Fail', () => {
    let connection;
    let database;
    let users;
    let generated_id;
  
    beforeAll(async () => {
      connection = await MongoClient.connect(credentials.getMongoUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      database = connection.db(databaseName);
      users = database.collection('users');
      var response = await controller.create_user(username_1, email_1, password);
      generated_id = response._id;
      
    });
  
    afterAll(async () => {
      await users.deleteOne({_id: generated_id});
      await connection.close();
    });
  
    it('Fails to insert a user with non-unique username', async () => {
      
      response = await controller.create_user(username_1, email_2, password);

      expect(response[0]).toEqual('400');
      expect(response[1]).toEqual('Email or username is not unique.');

    });

    it('Fails to insert a user with non-unique email', async () => {
      
      response = await controller.create_user(username_2, email_1, password);

      expect(response[0]).toEqual('400');
      expect(response[1]).toEqual('Email or username is not unique.');

    });
  });
