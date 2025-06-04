// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();

const AssignmentModel = require('../model/assignment.model');
const UserModel = require('../model/user.model');
const ProjectModel = require('../model/project.model');
const { authMiddleware, managerAuth } = require('../middleware/authMiddleware'); 


//1. /api/assignments
//2. /api/assignments/:id


// Create assignment (Manager only)
router.post('/', managerAuth, async (req, res) => {
  const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = req.body;

  try {
    const engineer = await UserModel.findById(engineerId);
    if (!engineer || engineer.role !== 'engineer') {
      return res.status(404).json({ error: 'Engineer not found or invalid role' });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const overlappingAssignments = await AssignmentModel.find({
      engineerId,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    const totalAllocation = overlappingAssignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );

    if (totalAllocation + allocationPercentage > engineer.maxCapacity) {
      return res.status(400).json({
        error: `Assignment would exceed engineer's capacity (${totalAllocation + allocationPercentage} > ${engineer.maxCapacity})`
      });
    }

    const newAssignment = new AssignmentModel({
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role
    });

    const saved = await newAssignment.save();
    const populatedAssignment = await saved.populate("engineerId projectId");

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: populatedAssignment
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await AssignmentModel.find()
      .populate('engineerId', 'name email skills role')
      .populate('projectId', 'name status')
      .sort({ startDate: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Update assignment by ID
router.post('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Delete assignment by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAssignment = await AssignmentModel.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json({ message: 'Assignment deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

//  Get all assignments for a specific engineer
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const assignments = await AssignmentModel.find({ engineerId: id })
      .populate("projectId", "name description startDate endDate")
      .populate("engineerId", "name email maxCapacity");

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({ error: 'No assignments found for this engineer' });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
