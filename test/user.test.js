const controller = require('../mongo/controller');
const DBManager = require('./helper');
const bcrypt = require('bcrypt');
const { getUserById } = require('../mongo/controller');

const dbConnection = new DBManager();

let username_1 = "KimTastic";
let username_2 = "KimTasticP";
let password = "strongPassword";
let email_1 = "this.is@goodemail.yes";
let email_2 = "this.is@goodemail2.yes";
let email_3 = "test";

describe('Create user', () => {

  beforeAll(async () => {
    await dbConnection.start();
  });

  afterEach(async () => {
    await dbConnection.cleanup();
  });

  afterAll(async () => {
    await dbConnection.stop();
  });

  it('Successfully creates user', async () => {

    await controller.create_user(username_1, email_1, password, dbConnection.db);
    response = await dbConnection.db.collection('users').findOne({username: username_1});

    generated_id = response._id;

    expect(response.username).toEqual(username_1);
    expect(response.email).toEqual(email_1);
    expect(response.score).toEqual(0);
    expect(response.challengesCreated).toEqual([]);
    expect(response.submissions).toEqual([]);

  });
});

describe('Create user', () => {

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

  it('Fails to insert a user with invalid password format', async () => {

    response = await controller.create_user(username_2, email_2, 'a', dbConnection.db);

    expect(response[0]).toEqual('400');
    expect(response[1]).toEqual('Password format not valid.');

  });

  it('Fails to insert a user with non-unique username', async () => {

    response = await controller.create_user(username_1, email_2, password, dbConnection.db);

    expect(response[0]).toEqual('400');
    expect(response[1]).toEqual('Username is not unique.');

  });

  it('Fails to insert a user with non-unique email', async () => {

    response = await controller.create_user(username_2, email_1, password, dbConnection.db);

    expect(response[0]).toEqual('400');
    expect(response[1]).toEqual('Email is not unique.');

  });

});

// Normal user deletion tests
describe('Delete user', () => {

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

  it('Successfully deleting user', async () => {
    user = await controller.getUserByUsername(username_1, dbConnection.db);
    response = await controller.delete_user(user["_id"], password, dbConnection.db);

    expect(response[0]).toEqual('201');
    expect(response[1]).toEqual('Successfully deleted user.');

    response = await getUserById(user["_id"], dbConnection.db);
    expect(response[0]).toEqual('404');
    expect(response[1]).toEqual('User with this id does not exist.');
  });

});

// Error user deletion tests
describe('Delete user', () => {

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

  it('Fails to delete user due to non-existing user.', async () => {
    user = await controller.getUserByUsername(username_1, dbConnection.db);
    response = await controller.delete_user("incorrectId", password, dbConnection.db);

    expect(response[0]).toEqual('404');
    expect(response[1]).toEqual('User with this id does not exist.');
  });

  it('Fails to delete user due to incorrect password.', async () => {
    user = await controller.getUserByUsername(username_1, dbConnection.db);
    response = await controller.delete_user(user["_id"], "incorrectPass", dbConnection.db);

    expect(response[0]).toEqual('401');
    expect(response[1]).toEqual('Password provided is incorrect.');
  });

});

// Normal update user tests
describe('Update user', () => {

  beforeAll(async () => {
    await dbConnection.start();
  });

  beforeEach(async () => {
    await controller.create_user(username_1, email_1, password, dbConnection.db);
    await controller.create_user(username_2, email_2, password, dbConnection.db);

  });

  afterEach(async () => {
    await dbConnection.cleanup();
  });

  afterAll(async () => {
    await dbConnection.stop();
  });

  it('Successfully updating user', async () => {
    user = await controller.getUserByUsername(username_1, dbConnection.db);
    response = await controller.update_user(user["_id"], "newUsername", "newPassword", dbConnection.db);

    expect(response[0]).toEqual('201');
    expect(response[1]).toEqual('Successfully updated user.');

    response = await getUserById(user["_id"], dbConnection.db);
    response = response[1];

    expect(response.username).toEqual("newUsername");
    var pass_check =  bcrypt.compareSync("newPassword", response.password)
    expect(pass_check).toEqual(true);
  });

});

// Error update user tests
describe('Update user', () => {

  beforeAll(async () => {
    await dbConnection.start();
  });

  beforeEach(async () => {
    await controller.create_user(username_1, email_1, password, dbConnection.db);
    await controller.create_user(username_2, email_2, password, dbConnection.db);

  });

  afterEach(async () => {
    await dbConnection.cleanup();
  });

  afterAll(async () => {
    await dbConnection.stop();
  });

  it('Fails to update user due to non-unique username.', async () => {
    user = await controller.getUserByUsername(username_1, dbConnection.db);

    response = await controller.update_user(user["_id"], username_2, password, dbConnection.db);
    expect(response[0]).toEqual('400');
    expect(response[1]).toEqual('Username is not unique.');

    response = await getUserById(user["_id"], dbConnection.db);
    response = response[1];

    expect(response.username).toEqual(username_1);
    var pass_check =  bcrypt.compareSync(password, response.password)
    expect(pass_check).toEqual(true);
  });

  it('Fails to update user due to invalid password format.', async () => {
    user = await controller.getUserByUsername(username_1, dbConnection.db);
    response = await controller.update_user(user["_id"], username_1, " ", dbConnection.db);

    expect(response[0]).toEqual('400');
    expect(response[1]).toEqual('Password format not valid.');

    response = await getUserById(user["_id"], dbConnection.db);
    response = response[1];

    expect(response.username).toEqual(username_1);
    var pass_check =  bcrypt.compareSync(password, response.password)
    expect(pass_check).toEqual(true);
  });

});

//Normal query user info tests
describe('Query user info', () => {

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

  it('Successfully queries user info', async () => {

    response = await controller.getUserByUsername(username_1, dbConnection.db)

    expect(response.username).toEqual(username_1);
    expect(response.email).toEqual(email_1);
    expect(response.score).toEqual(0);
    expect(response.challengesCreated).toEqual([]);
    expect(response.submissions).toEqual([]);
  });

});

describe('User login', () => {

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

  it('Successfully login user', async () => {

    var response = await controller.validatePassword(username_1, password, dbConnection.db);

    expect(response[1]).toEqual(true);
    expect(response[0].username).toEqual(username_1);

  });
});

describe('User login', () => {

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

  it('Fails to login user with incorrect username', async () => {

    var response = await controller.validatePassword(username_2, password, dbConnection.db);

    expect(response[1]).toEqual(false);
    expect(response[0]).toEqual(null);

  });

  it('Fails to login user with incorrect password', async () => {

    var response = await controller.validatePassword(username_1, 'badpassword', dbConnection.db);

    expect(response[1]).toEqual(false);
    expect(response[0].username).toEqual(username_1);

  });
});

describe('Leaderboard', () => {
  let users = [
    ["Boss", "boss@tester.com", password, 25],
    ["Chief", "chief@tester.com", password, 100],
    ["Null", "null@tester.com", password, 0],
    ["Baws", "baws@tester.com", password, 25],
  ];

  beforeAll(async () => {
    await dbConnection.start();
  });

  afterEach(async () => {
    await dbConnection.cleanup();
  });

  afterAll(async () => {
    await dbConnection.stop();
  });

  it('Get populated leaderboard successfully', async () => {
    const database = dbConnection.db;
    for (let user of users) {
      await controller.create_user(user[0], user[1], user[2], dbConnection.db);
      await database.collection("users").updateOne(
          {"username": user[0]},
          {
            $set: {
              "score": user[3]
            },
            $currentDate: {lastModified: true}
          }
      );
    }

    const expectedLeaderboard = [
      {username: 'Chief', score: 100},
      {username: 'Baws', score: 25},
      {username: 'Boss', score: 25},
      {username: 'Null', score: 0}
    ];

    const returnedLeaderboard = await controller.getLeaderboard(dbConnection.db);

    expect(JSON.stringify(returnedLeaderboard)).toEqual(JSON.stringify(expectedLeaderboard));
  });

});
