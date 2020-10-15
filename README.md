### ECSE428_G07_Backend

Install npm v6.14.8 and node v12.19.0 (LTS versions). Using nvm is also very useful in order to switch between node versions.

Run npm install to get all the dependencies specified in package.json

Start server by typing: **npm start** while in the backend directory.
Start development server by typing: **yarn dev** while in the backend directory.
<br>
All below endpoints require: http://localhost:9000/ for testing
<br>
<br>
To run tests, after installing jest, type ***npm run test*** from root directory
<br>

------------------------------------------------------------

### GET `/testMongo`
| Usage  | Parameters | Returns |
| ------------- | ------------- | ------------- |
| Testing if you can connect to db.  | header: {key: value, value: [anything]} | [anything]

| Errors  |
| ------------- |
| None |

------------------------------------------------------------
### POST `/create-user`
| Usage  | Parameters | Returns |
| ------------- | ------------- | ------------- |
| Creates a user in the data base.  | header: {username,email,password} | 201, "Successfully created user."

| Errors  |
| ------------- |
| 500, "Database action failed." |
| 400, "Empty username" |
| 400, "Invalid username" |
| 400, "Invalid email address" |
| 400, "Empty password" |

------------------------------------------------------------
