const MongoClient = require('mongodb').MongoClient;
const credentials = require('../mongo/credentials');
const controller = require('../mongo/controller');

// TEST: Check if inserted user is found in the mongodb database
describe('insert', () => {
    let connection;
    let database;
    let users;
    let databaseName = "CodeClash";
  
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
  
    it('should insert a name into mongo', async () => {
      
      let name = "John";

      const mockUser = {name: name};
      generated_id = await controller.test('John');
      const insertedUser = await users.findOne({_id: generated_id});
      expect(insertedUser.name).toEqual(mockUser.name);

    });
  });
