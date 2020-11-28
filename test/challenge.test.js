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
const challengeName2 = "Max Height 2.0";
const description = "Given a list of x and y coordinates that make up a 2D function, find the 2 points, (x, y) coordinates, upon where there is the largest increase from one point to another in the y axis and return the difference in height.";
const funcSignature = "int maxHeight(std::vector<tuple<int, int>>)"
const localTests = "{\"input\": \"[(1,2), (2,2), (3,4)]\", \"output\": \"2\"}";
const hiddenTests = "{\"input\": \"[(5,5), (1,8), (1,23)]\", \"output\": \"15\"}";
const solution = "int maxHeight(std::vector<tuple<int, int>>){return 2}";
const languages = "c++";

describe('Create Challenge', () => {

    let creatorId;
    let whiteSpace = "  ";

    beforeAll(async () => {
        await dbConnection.start();
    });

    beforeEach(async () => {
        await controller.create_user(username, email, password, dbConnection.db);
        let user = await controller.getUserByUsername(username, dbConnection.db);
        creatorId = user["_id"].toString();
    });

    afterEach(async () => {
        await dbConnection.cleanup();
    });

    afterAll(async () => {
        await dbConnection.stop();
    });

    it('Successfully creates challenge', async () => {
        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, languages, funcSignature,
            solution, localTests, hiddenTests);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(201);
        expect(response[1]).toEqual("Successfully created the challenge");

        let expectedChallenge = {
            "challengeName": challengeName,
            "creatorId": creatorId,
            "description": description,
            "language": languages,
            "functionSignature": funcSignature,
            "localTests": JSON.parse(localTests),
            "hiddenTests": JSON.parse(hiddenTests),
            "solution": solution,
        };
        let returnedChallenge = await controller.getChallengeByName(challengeName, dbConnection.db);
        expect(returnedChallenge).toMatchObject(expectedChallenge);

    });

    it('Missing name', async () => {
        let response = await controller.createChallenge(dbConnection.db, whiteSpace, creatorId,
            description, languages, funcSignature,
            solution, localTests, hiddenTests);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Missing challenge name parameter");
    });

    it('Existing name', async () => {
        //create challenge before checking that duplicate creation will fail
        await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, languages, funcSignature,
            solution, localTests, hiddenTests);

        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, languages, funcSignature,
            solution, localTests, hiddenTests);

        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Challenge name is not unique");
    });

    it('Missing description', async () => {
        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            whiteSpace, languages, funcSignature,
            solution, localTests, hiddenTests);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Missing challenge description parameter");
    });

    it('Missing language', async () => {
        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, null, funcSignature,
            solution, localTests, hiddenTests);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Missing challenge language parameter");
    });

    it('Missing function signature', async () => {
        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, languages, "    ",
            solution, localTests, hiddenTests);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Missing function signature parameter");
    });

    it('Missing local tests', async () => {
        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, languages, funcSignature,
            solution, null, hiddenTests);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Missing local test cases parameter");
    });

    it('Invalid local tests', async () => {
        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, languages, funcSignature,
            solution, "not valid JSON", hiddenTests);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Provided local tests are not valid");
    });

    it('Missing hidden tests', async () => {
        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, languages, funcSignature,
            solution, localTests, null);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Missing hidden test cases parameter");
    });

    it('Invalid hidden tests', async () => {
        let response = await controller.createChallenge(dbConnection.db, challengeName, creatorId,
            description, languages, funcSignature,
            solution, localTests, "not valid JSON");
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Provided hidden tests are not valid");
    });

});

describe('Get challenge attributes', () => {

    let creatorId;

    beforeAll(async () => {
        await dbConnection.start();
        await controller.create_user(username, email, password, dbConnection.db);
        let user = await controller.getUserByUsername(username, dbConnection.db);
        creatorId = user["_id"].toString();
    });

    afterEach(async () => {
        await dbConnection.cleanup();
    });

    afterAll(async () => {
        await dbConnection.stop();
    });

    it('Missing challenge name', async () => {
        const database = dbConnection.db;
        //create challenge before checking that attributes query will fail
        await controller.createChallenge(database, challengeName, creatorId,
            description, languages, funcSignature,
            solution, localTests, hiddenTests);

        let response = await controller.getChallengeAttributes(database, null);

        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Missing challenge name parameter");
    });

    it('Challenge does not exit', async () => {
        const database = dbConnection.db;
        let response = await controller.getChallengeAttributes(database, "IdoNotExist#2020");
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Challenge does not exist");
    });

    it('Challenge is closed', async () => {
        const database = dbConnection.db;
        //create challenge and close it before checking that attributes query will fail
        await controller.createChallenge(database, challengeName, creatorId,
            description, languages, funcSignature,
            solution, localTests, hiddenTests);

        let challenge = await controller.getChallengeByName(challengeName, database);

        await controller.closeChallenge(database, creatorId, challengeName, challenge["_id"]);

        let response = await controller.getChallengeAttributes(database, challengeName);
        expect(response.length).toEqual(2);
        expect(parseInt(response[0])).toEqual(400);
        expect(response[1]).toEqual("Challenge can no longer be solved");
    });

    it('Successfully returns challenge attributes', async () => {
        const database = dbConnection.db;
        await controller.createChallenge(database, challengeName, creatorId,
            description, languages, funcSignature,
            solution, localTests, hiddenTests);

        let expectedChallenge = await controller.getChallengeByName(challengeName, database);
        let expectedAttributes = [challengeName, username, description, languages, funcSignature, JSON.parse(localTests), expectedChallenge._id];

        let [code, returnedAttributes] = await controller.getChallengeAttributes(database, challengeName);
        expect(parseInt(code)).toEqual(200);
        expect(returnedAttributes).toEqual(expectedAttributes);

    });
});

describe('Query all challenges', () => {

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
      await controller.createChallenge(dbConnection.db, challengeName2, creatorId,
                                        description, languages, funcSignature,
                                        solution, localTests, hiddenTests);

    });

    afterEach(async () => {
      await dbConnection.cleanup();
    });

    afterAll(async () => {
      await dbConnection.stop();
    });

    it('Successfully queries all challenges', async () => {

      var response = await controller.getAllActiveChallenges(dbConnection.db);

      expect(response.length).toEqual(2);
      expect(response[0].challengeName).toEqual(challengeName);
      expect(response[1].challengeName).toEqual(challengeName2);

      // Get user id
      var author = await controller.getUserById(response[0].creatorId, dbConnection.db);

      expect(author[1].username).toEqual(username);
      expect(response[0].language).toEqual(languages);

    });

    it('Alternative querying of all challenges', async () => {
      var challengeId = await controller.getChallengeByName(challengeName2, dbConnection.db);
      await controller.deleteChallenge(challengeId._id, challengeName2, username, dbConnection.db);
      var response = await controller.getAllActiveChallenges(dbConnection.db);

      expect(response.length).toEqual(1);
      expect(response[0].challengeName).toEqual(challengeName);
      expect(response[0].language).toEqual(languages);

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

    it('Failed to close challenge because challenge is already closed', async () => {
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

describe('Delete challenge', () => {

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

  it('Successfully delete challenge', async () => {
    var challenge = await controller.getChallengeByName(challengeName, dbConnection.db);
    var challengeId = challenge["_id"].toString();
    var user = await controller.getUserByUsername(username, dbConnection.db);
    var creatorName = user["username"].toString();

    var response = await controller.deleteChallenge(challengeId, challengeName, creatorName, dbConnection.db);
    expect(response[0]).toEqual(200);
    expect(response[1]).toEqual('Successfully deleted challenge.');
  });

  it("Failed to delete challenge that isn't yours", async () => {
    var testUsername = "testUser";
    await controller.create_user(testUsername, "test@gmail.com", "password", dbConnection.db);
    var challenge = await controller.getChallengeByName(challengeName, dbConnection.db);
    var challengeId = challenge["_id"].toString();
    var user = await controller.getUserByUsername(testUsername, dbConnection.db);
    var creatorName = user["username"].toString();

    await controller.deleteChallenge(challengeId, challengeName, creatorName, dbConnection.db);
    var response = await controller.deleteChallenge(challengeId, challengeName, creatorName, dbConnection.db);
    expect(response[0]).toEqual("400");
    expect(response[1]).toEqual('Incorrect author.');
  });
});

describe('Submit code', () => {

    const submissionCode = "function factorial(n) {if (n == 0 || n == 1)return 1;return factorial(n-1) * n;}";
    const compilationError = "function factorial(n)if (n == 0 || n == 1)return 1;return factorial(n-1) * n;";
    const runtimeError = "function factorial(n) {var test = 0; test.then(result=>{console.log(result)}); if (n == 0 || n == 1)return 1;return factorial(n-1) * n;}";

    beforeAll(async () => {
      await dbConnection.start();
    });
  
    beforeEach(async () => {
      await controller.create_user(username, email, password, dbConnection.db);
      var user = await controller.getUserByUsername(username, dbConnection.db);
      var creatorId = user["_id"].toString();
      await controller.createChallenge(dbConnection.db, "Factorial", creatorId,
          description, languages, funcSignature,
          solution, "{\"input\": \"[1, 0, 2]\", \"output\": \"[1, 1, 2]\"}", "{\"input\": \"[5, 4]\", \"output\": \"[120, 24]\"}");
    });
  
    afterEach(async () => {
      await dbConnection.cleanup();
      await dbConnection.stop();
      await dbConnection.start();
    });
  
    afterAll(async () => {
      await dbConnection.stop();
    });
  
    it('Successfully submit challenge with perfect score', async () => {
        var challenge = await controller.getChallengeByName("Factorial", dbConnection.db);
        var challengeId = challenge["_id"].toString();
        await controller.create_user("todd", "todd.c@ma.com", password, dbConnection.db);
        var user = await controller.getUserByUsername("todd", dbConnection.db);

        expect(user.score).toEqual(0);

        await controller.submitChallenge(challengeId, submissionCode, user._id, dbConnection.db);
        user = await controller.getUserByUsername("todd", dbConnection.db);

        expect(user.score).toEqual(100);

    });

    it('Failed submission with compilation error', async () => {
        var challenge = await controller.getChallengeByName("Factorial", dbConnection.db);
        var challengeId = challenge["_id"].toString();
        await controller.create_user("todd", "todd.c@ma.com", password, dbConnection.db);
        var user = await controller.getUserByUsername("todd", dbConnection.db);

        expect(user.score).toEqual(0);

        await controller.submitChallenge(challengeId, compilationError, user._id, dbConnection.db);
        user = await controller.getUserByUsername("todd", dbConnection.db);

        expect(user.score).toEqual(0);

    });

    it('Failed submission with runtime error', async () => {
        var challenge = await controller.getChallengeByName("Factorial", dbConnection.db);
        var challengeId = challenge["_id"].toString();
        await controller.create_user("todd", "todd.c@ma.com", password, dbConnection.db);
        var user = await controller.getUserByUsername("todd", dbConnection.db);

        expect(user.score).toEqual(0);

        await controller.submitChallenge(challengeId, runtimeError, user._id, dbConnection.db);
        user = await controller.getUserByUsername("todd", dbConnection.db);

        expect(user.score).toEqual(0);

    });

});
