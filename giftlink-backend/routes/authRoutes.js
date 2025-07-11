// Step 1 - Task 2: Import necessary packages
const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');

// Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

dotenv.config();

// Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Step 2: Registration endpoint (será completado no próximo passo)
router.post('/register', async (req, res) => {
  // lógica virá aqui
});

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB
        const db = await connectToDatabase();

        // Task 2: Access MongoDB collection
        const collection = db.collection("users");

        // Task 3: Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).send("User with this email already exists");
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        // Task 4: Save user details in database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Task 5: Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email });
    } catch (e) {
        logger.error('Error during registration:', e.message);
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('users');

    const theUser = await collection.findOne({ email: req.body.email });

    if (!theUser) {
      logger.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcryptjs.compare(req.body.password, theUser.password);
    if (!isMatch) {
      logger.error('Passwords do not match');
      return res.status(401).json({ error: 'Wrong password' });
    }

    const userName = theUser.firstName;
    const userEmail = theUser.email;

    const payload = {
      user: {
        id: theUser._id.toString(),
      },
    };
    const authtoken = jwt.sign(payload, JWT_SECRET);

    logger.info('User logged in successfully');
    res.json({ authtoken, userName, userEmail });

  } catch (e) {
    logger.error('Login error:', e.message);
    return res.status(500).send('Internal server error');
  }
});

router.put('/update', [
    body('firstName').not().isEmpty().withMessage('First name is required'),
    body('lastName').not().isEmpty().withMessage('Last name is required')
  ], async (req, res) => {
    // Step 2: Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors in update request', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      // Step 3: Check if email is present in headers
      const email = req.headers.email;
      if (!email) {
        logger.error('Email not found in the request headers');
        return res.status(400).json({ error: "Email not found in the request headers" });
      }
  
      // Step 4: Connect to MongoDB and access collection
      const db = await connectToDatabase();
      const collection = db.collection("users");
  
      // Step 5: Find user
      const existingUser = await collection.findOne({ email });
      if (!existingUser) {
        logger.error('User not found');
        return res.status(404).json({ error: "User not found" });
      }
  
      // Step 6: Update user details
      existingUser.firstName = req.body.firstName;
      existingUser.lastName = req.body.lastName;
      existingUser.updatedAt = new Date();
  
      const updatedUser = await collection.findOneAndUpdate(
        { email },
        { $set: existingUser },
        { returnDocument: 'after' }
      );
  
      // Step 7: Generate new JWT
      const payload = {
        user: {
          id: updatedUser.value._id.toString(),
        },
      };
      const authtoken = jwt.sign(payload, JWT_SECRET);
  
      logger.info('User updated successfully');
      res.json({ authtoken });
  
    } catch (e) {
      logger.error('Error updating user profile:', e.message);
      return res.status(500).send('Internal server error');
    }
  });  

module.exports = router;
