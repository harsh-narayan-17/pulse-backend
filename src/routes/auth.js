const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);

module.exports = router;
