const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }


    const userExists = await User.findByEmail(email);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const userId = await User.create(name, email, hashedPassword);

    if (userId) {
      res.status(201).json({
        id: userId,
        name: name,
        email: email,
        token: generateToken(userId),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
