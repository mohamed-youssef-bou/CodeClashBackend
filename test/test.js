const controller = require('../mongo/controller');
const DBManager = require('./helper');

const dbConnection = new DBManager();

let username_1 = "KimTastic";
let username_2 = "KimTasticP";
let password = "strongPassword";
let email_1 = "this.is@goodemail.yes";
let email_2 = "this.is@goodemail2.yes"

describe('Insert User', () => {
    
    beforeAll(async () => {
      await dbConnection.start();
    });
  
    afterEach(async () => {
      await dbConnection.cleanup();
    });

    afterAll(async () => {
      await dbConnection.stop();
    });
  
    it('Successfully inserts a user into mongodb', async () => {

      await controller.create_user(username_1, email_1, password, dbConnection.db);
      response = await dbConnection.db.collection('users').findOne({username: username_1});

      generated_id = response._id;

      expect(response.username).toEqual(username_1);
      expect(response.email).toEqual(email_1);
      expect(response.score).toEqual(0);
      expect(response.challengesCreated).toEqual('');
      expect(response.submissions).toEqual('');

    });
  });

  describe('Insert user', () => {
    
    beforeAll(async () => {
      await dbConnection.start();
    });

    beforeEach(async () => {
      await controller.create_user(username_1, email_1, password, dbConnection.db);
    });
  
    afterEach(async () => {
      await dbConnection.cleanup();
    });

    afterAll(async () => {
      await dbConnection.stop();
    });
  
    it('Fails to insert a user with non-unique username', async () => {
      
      response = await controller.create_user(username_1, email_2, password, dbConnection.db);

      expect(response[0]).toEqual('400');
      expect(response[1]).toEqual('Email or username is not unique.');

    });

    it('Fails to insert a user with non-unique email', async () => {
      
      response = await controller.create_user(username_2, email_1, password, dbConnection.db);

      expect(response[0]).toEqual('400');
      expect(response[1]).toEqual('Email or username is not unique.');

    });
  });
