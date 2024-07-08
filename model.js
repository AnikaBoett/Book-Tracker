const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
require("dotenv").config()
mongoose.connect(process.env.DATABASE)
const userSchema = new mongoose.Schema({
    username: {type: String, required: [true, "Username is required."]},
    email: {type: String, required: [true, "Email is required."], unique: true},
    encryptedPassword: {type: String, required: [true, "Password is required."]},
    bio: String,
    location: String,
    displayName: String,
    interests: Array
})
userSchema.methods.hashPassword = async function (password) {
    try {
        let hashedPassword = await bcrypt.hash(password, 12)
        this.encryptedPassword = hashedPassword
    } catch (error) {
        console.log(error)
    }
}
userSchema.methods.verifyPassword = async function (password) {
    try {
        let isGood = await bcrypt.compare(password, this.encryptedPassword)
        return isGood
    } catch (error) {
        console.log(error)
    }
}
const User = mongoose.model("users", userSchema)
module.exports = {User: User}