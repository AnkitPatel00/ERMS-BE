const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const UserModel = require('../model/user.model'); // adjust the path
const { authMiddleware, managerAuth } = require('../middleware/authMiddleware'); // adjust the path


//1. /api/auth/login
//2. /api/auth/register
//3. /api/auth/profile
//4. /api/auth/profile/:userId


//1. login 

router.post("/login", async(req,res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Respond with token and user info
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

//2. register

router.post("/register", async (req, res) => {
  const { name, email, role, password, skills, seniority, maxCapacity, department } = req.body;
  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = new UserModel({
      name,
      email,
      role,
      password: hashedPassword,
      skills: role === 'engineer' ? skills : [],
      seniority: role === 'engineer' ? seniority : null,
      maxCapacity: role === 'engineer' ? maxCapacity : null,
      department: role === 'engineer' ? department : null
    });

    // Save the user
    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
})


//3. GET /api/auth/profile


router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user.id is set by authMiddleware after verifying JWT
    const user = await UserModel.findById(req.user.id).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});


//4. update profile

// POST /profile/:userId
router.post('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the logged-in user is allowed to update this profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this profile" });
    }

    const { name, department, seniority, maxCapacity, skills } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name,
        department,
        seniority,
        maxCapacity,
        skills,
      },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports =router