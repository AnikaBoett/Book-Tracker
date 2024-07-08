const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
require("dotenv").config()
mongoose.connect(process.env.DATABASE)
module.exports = {}