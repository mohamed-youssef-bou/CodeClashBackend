const express = require('express');
const router = express.Router();

/*
Only users with verified tokens can access the routes defined below
Example: unused profile endpoint, only users with a verified token will be presented with the secure route message
 */

router.get(
  '/profile',
  (req, res, next) => {
    res.json({
      message: 'You made it to the secure route',
      user: req.user,
      token: req.query.secret_token
    })
  }
);

module.exports = router;