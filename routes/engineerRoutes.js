// routes/engineerRoutes.js
const express = require('express');
const router = express.Router();
const UserModel = require('../model/user.model'); 
const AssignmentModel = require('../model/assignment.model'); 
const {managerAuth,authMiddleware} = require('../middleware/authMiddleware');

//  GET all engineers (Manager access only)
router.get('/', managerAuth, async (req, res) => {
  try {
    const engineers = await UserModel.find({ role: 'engineer' }).select('-password');
    res.status(200).json(engineers);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

//  GET engineer capacity by ID
router.get('/:id/capacity', async (req, res) => {
  const { id } = req.params;
  try {
    const engineer = await UserModel.findById(id);
    if (!engineer || engineer.role !== 'engineer') {
      return res.status(404).json({ error: 'Engineer not found' });
    }

    const today = new Date();

    const assignments = await AssignmentModel.find({
      engineerId: id,
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    const usedCapacity = assignments.reduce(
      (total, assign) => total + assign.allocationPercentage,
      0
    );

    const availableCapacity = Math.max(engineer.maxCapacity - usedCapacity, 0);

    res.status(200).json({
      engineerId: id,
      maxCapacity: engineer.maxCapacity,
      usedCapacity,
      availableCapacity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
