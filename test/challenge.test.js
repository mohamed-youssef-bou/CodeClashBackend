const controller = require('../mongo/controller');
const DBManager = require('./helper');
const bcrypt = require('bcrypt');
const { getUserById } = require('../mongo/controller');

const dbConnection = new DBManager();

// Creating user
const usernmae = "timmyTip";
const password = "gemini";
const email = "timmy.tip@gemini.com";

// Creating challenge
const challengeName = "Max Height";
const description = "Given a list of x and y coordinates that make up a 2D function, find the 2 points, (x, y) coordinates, upon where there is the largest increase from one point to another in the y axis and return the difference in height.";
const functionSignature = "int maxHeight(std::vector<tuple<int, int>>)"
const localTests = "[{\"input\": [(1,2), (2,2), (3,4)]}], \"output\": 2";
const solution = "int maxHeight(std::vector<tuple<int, int>>){return 2}";
const dateCreated = new Date();
const dateClosed = null;

describe('Query all challenges', () => {

    beforeAll(async () => {
      await dbConnection.start();
    });
  
    afterEach(async () => {
      await dbConnection.cleanup();
      await controller.create_user(usernmae, email, password, dbConnection.db);
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

