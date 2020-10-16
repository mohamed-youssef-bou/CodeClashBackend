# CodeClash Backend

### Usage
Install npm v6.14.8 and node v12.19.0 (LTS versions). Using nvm is also very useful in order to switch between node versions.

Run npm install to get all the dependencies specified in package.json

Start server by typing: **npm start** while in the backend directory.
<br>
Start development server by typing: **yarn dev** while in the backend directory.
<br>
To run tests, after installing jest, type ***npm run test*** from root directory

### Endpoints
All below endpoints require: http://localhost:9000/ for testing
<br>
<br>

------------------------------------------------------------
### POST `/`
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
### GET `/:id`
| Usage  | Parameters | Returns |
| ------------- | ------------- | ------------- |
| Retrieves a user object and its related info from the database.  | request param: id of user | 200, user: JSON 

| Errors  |
| ------------- |
| 500, "Internal Server Error" |
| 404, "User with this id does not exist" |
| 400, "\_id cannot be null" |

------------------------------------------------------------
### POST `/deleteUser`
| Usage  | Parameters | Returns |
| ------------- | ------------- | ------------- |
| Deletes a user in the data base.  | header: {user_id,password} | 201, "Successfully deleted user."

| Errors  |
| ------------- |
| 500, "Database action failed." |
| 404, "User with this id does not exist" |
| 401, "Password provided is incorrect" |
| 400, "Empty user ID" |
| 400, "Empty password" |

------------------------------------------------------------
### POST `/login`
| Usage  | Parameters | Returns |
| ------------- | ------------- | ------------- |
| Login into the system  | parameters: username, password | 200, token: token string to be used for authenticated operations/endpoints 

| Errors  |
| ------------- |
| 500, "Internal Server Error" |
| 400, "Empty username" |
| 400, "Invalid username" |
| 400, "Empty password" |
| 400, "No account exists with those credentials" |
| 400, "he password you entered is incorrect" |


------------------------------------------------------------

