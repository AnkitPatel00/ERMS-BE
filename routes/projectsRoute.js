// routes/projectRoutes.js
const express = require('express');
const router = express.Router();

const ProjectModel = require('../model/project.model'); //
const {managerAuth,authMiddleware} = require('../middleware/authMiddleware');

//  Create Project (Manager only)
router.post('/', managerAuth, async (req, res) => {
  const {
    name,
    description,
    startDate,
    endDate,
    requiredSkills,
    teamSize,
    status
  } = req.body;

  try {
    const newProject = new ProjectModel({
      name,
      description,
      startDate,
      endDate,
      requiredSkills,
      teamSize,
      status,
      managerId: req.user._id
    });

    const savedProject = await newProject.save();

    res.status(201).json({
      message: 'Project created successfully',
      project: savedProject
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

//  Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await ProjectModel.find()
      .populate('managerId', 'name email')
      .sort({ startDate: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

//  Get project by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const project = await ProjectModel.findById(id)

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
