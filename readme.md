# Engineering Resource Management System
## Backend
### Setup
 - npm install
 - .env File
   - MOGO_URI : databse uri
   - PORT : 3000
   - JWT_SECRET: your secret

## Features
 - register as manager or engineer
 - login
 - dashboard (capacity lfet in %)
 - create projects
 - Team overview
 - create assignments

## Api routes

 ### user
 - POST /api/auth/login
 - POST /api/auth/register
 - GET /api/auth/profile
 - POST /api/auth/profile/:userId

 ### project
 - POST /api/projects
 - GET /api/projects
 - GET /api/projects/:id

 ### engineer
  - GET /api/engineers
  - GET /api/engineers/:id/capacity

 ### assignments
  - POST /api/assignments
  - GET /api/assignments
  - GET /api/assignments
  - GET /api/assignments/:id
  - POST /api/assignments/:id
  - DELETE /api/assignments/:id