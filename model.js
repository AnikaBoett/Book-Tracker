const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
require("dotenv").config()
mongoose.connect(process.env.DATABASE)
const bookSchema = new mongoose.Schema({title: {type: String, required: [true, "Book must have a title."]}, isbn: {type: Number, required: [true, "Book must have an isbn."]}, summary: String, owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "Book must have an owner."]}})
const userSchema = new mongoose.Schema({username: {type: String, required: [true, "Username is required."]}, email: {type: String, required: [true, "Email is required."], unique: true}, encryptedPassword: {type: String, required: [true, "Password is required."]}})
const profileSchema = new mongoose.Schema({owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "Profile must be associated with a user."]}, displayName: {type: String, required: [true, "Profile must have a display name."]}, bio: {type: String, required: [true, "Profile must have a bio."]}, location: {type: String, required: [true, "Profile must have a location."]}, interests: {type: String, required: [true, "Profile must have interests."]}})
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
const Book = mongoose.model("Book", bookSchema)
const User = mongoose.model("User", userSchema)
const Profile = mongoose.model("Profile", profileSchema)
module.exports = {Book: Book, User: User, Profile: Profile}