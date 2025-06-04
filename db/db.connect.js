const mongoose = require('mongoose')
require('dotenv').config()

const MOGO_URI = process.env.MOGO_URI

const initializeDatabase = async() => {
  try {
    const isConnected = mongoose.connect(MOGO_URI)
    if (isConnected)
    {
      console.log("Connected Successfully.")
    }
  }
  catch (error)
  {
    console.log("Failed to Connect.")
  }
}

module.exports = initializeDatabase