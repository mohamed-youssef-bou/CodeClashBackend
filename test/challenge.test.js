const controller = require('../mongo/controller');
const DBManager = require('./helper');
const bcrypt = require('bcrypt');
const { getUserById } = require('../mongo/controller');

const dbConnection = new DBManager();

// Creating user
const username = "timmyTip";
const password = "gemini";
const email = "timmy.tip@gemini.com";

// Creating challenge
const challengeName = "Max Height";
const description = "Given a list of x and y coordinates that make up a 2D function, find the 2 points, (x, y) coordinates, upon where there is the largest increase from one point to another in the y axis and return the difference in height.";
const funcSignature = "int maxHeight(std::vector<tuple<int, int>>)"
const localTests = "{\"input\": \"[(1,2), (2,2), (3,4)]}]\", \"output\": 2}";
const hiddenTests = "{\"input\": \"[(5,5), (1,8), (1,23)]}]\", \"output\": 15}";
const solution = "int maxHeight(std::vector<tuple<int, int>>){return 2}";
const languages = "c++";

describe('Query all challenges', () => {

    beforeAll(async () => {
      await dbConnection.start();
    });
  
    afterEach(async () => {
      await dbConnection.cleanup();
      await controller.create_user(username, email, password, dbConnection.db);
      //await controller.create_challenge();
    });
  
    afterAll(async () => {
      await dbConnection.stop();
    });
  
    it('Successfully queries all challenges', async () => {
  
      var response = await controller.getAllActiveChallenges(dbConnection.db);
      console.log(response);
  
    });

  });

  describe('Close challenge', () => {

    beforeAll(async () => {
      await dbConnection.start();
    });
  
    beforeEach(async () => {
      await controller.create_user(username, email, password, dbConnection.db);
      var user = await controller.getUserByUsername(username, dbConnection.db); 
      var creatorId = user["_id"].toString(); 
      await controller.createChallenge(dbConnection.db, challengeName, creatorId, 
                                       description, languages, funcSignature, 
                                       solution, localTests, hiddenTests);
    });

    afterEach(async () => {
      await dbConnection.cleanup();
    });
  
    afterAll(async () => {
      await dbConnection.stop();
    });
  
    it('Successfully closes challenge', async () => {
      var challenge = await controller.getChallengeByName(challengeName, dbConnection.db); 
      var challengeId = challenge["_id"].toString();
      var user = await controller.getUserByUsername(username, dbConnection.db); 
      var creatorId = user["_id"].toString(); 

      var response = await controller.closeChallenge(dbConnection.db, creatorId, challengeName, challengeId);
      expect(response[0]).toEqual('201');
      expect(response[1]).toEqual('Successfully closed the challenge');
    });

    it('Closing a challenge that is already closed', async () => {
      var challenge = await controller.getChallengeByName(challengeName, dbConnection.db); 
      var challengeId = challenge["_id"].toString();
      var user = await controller.getUserByUsername(username, dbConnection.db); 
      var creatorId = user["_id"].toString(); 

      var response = await controller.closeChallenge(dbConnection.db, creatorId, challengeName, challengeId);
      var response = await controller.closeChallenge(dbConnection.db, creatorId, challengeName, challengeId);
      expect(response[0]).toEqual('400');
      expect(response[1]).toEqual('Challenge already closed!');
    });
    
  });


