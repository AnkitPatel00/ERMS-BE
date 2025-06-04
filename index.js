
const express = require('express')
const initializeDatabase = require('./db/db.connect')
const UserModel = require('./model/user.model')
const ProjectModel = require('./model/project.model')
const AssignmentModel = require('./model/assignment.model')
const { authMiddleware, managerAuth } = require('./middleware/authMiddleware');
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const app = express()
const cors = require('cors')
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(cors({origin:"*"}))
initializeDatabase()

const authRoutes = require('./routes/userRoutes');
const engineerRoutes = require('./routes/engineerRoutes');
const projectRoutes = require('./routes/projectsRoute');
const assignmentRoutes = require('./routes/assignmentRoutes');


app.get("/",(req,res) => {
  res.send("Welcome to Engineering Resource Management System Server")
})

//users route

app.use('/api/auth', authRoutes);


//engineer route

app.use('/api/engineers', engineerRoutes);


//engineer route

app.use('/api/projects', projectRoutes);


//assignment route

app.use('/api/assignments', assignmentRoutes);


app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`)
})