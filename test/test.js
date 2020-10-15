const MongoClient = require('mongodb').MongoClient;
const credentials = require('../mongo/credentials');
const controller = require('../mongo/controller');

var bcrypt = require('bcrypt');

// TEST: Check if inserted user is found in the mongodb database

describe('insert', () => {
    let connection;
    let database;
    let users;
    let databaseName = "CodeClash";
    var generated_id;
  
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
      
      let username = "KimTastic";
      let password = "strongPassword";
      let email = "this.is@goodemail.yes";

      await controller.create_user(username, email, password);
      response = await users.findOne({username: username});

      generated_id = response._id;

      expect(response.username).toEqual(username);
      expect(response.email).toEqual(email);
      expect(response.score).toEqual(0);

    });
  });

  describe('insert', () => {
    let connection;
    let database;
    let users;
    let databaseName = "CodeClash";
    var generated_id;

    let username_1 = "KimTastic";
    let password = "strongPassword";
    let email_1 = "this.is@goodemail.yes";
    let email_2 = "this.ia@goodemail.yes";
  
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
  });

  describe('insert', () => {
    let connection;
    let database;
    let users;
    let databaseName = "CodeClash";
    var generated_id;

    let username_1 = "KimTastic";
    let username_2 = "kimtastics";
    let password = "strongPassword";
    let email_1 = "this.is@goodemail.yes";
  
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
  
    it('Fails to insert a user with non-unique email', async () => {
      
      response = await controller.create_user(username_2, email_1, password);

      expect(response[0]).toEqual('400');
      expect(response[1]).toEqual('Email or username is not unique.');

    });
  });