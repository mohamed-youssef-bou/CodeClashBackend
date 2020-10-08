### ECSE428_G07_Backend

Install npm v6.14.8 and node v12.19.0 (LTS versions). Using nvm is also very useful in order to switch between node versions.

Run npm install or,

Individually install required dependencies:
- npm install express
- npm install aws-sdk
- npm install mongodb
- npm install morgan
- npm install cookie-parser

Start server by typing: **npm start** while in the backend directory.
<br>
All below endpoints require: http://localhost:9000/ for testing

------------------------------------------------------------

### GET `/testMongo`
| Usage  | Parameters | Returns |
| ------------- | ------------- | ------------- |
| Testing if you can connect to db.  | header: {key: value, value: [anything]} | [anything]

| Errors  |
| ------------- |
| None |

------------------------------------------------------------
