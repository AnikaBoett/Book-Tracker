const express = require("express")
const session = require("express-session")
const model = require("./model")
require("dotenv").config()
const app = express()
app.use(express.static("public"))
app.use(session({secret: "dsakdsnknqewknjkdfhnwian", saveUninitialized: true, resave: false}))
app.use(express.urlencoded({extended: true}))
app.get("/users", async function (request, response) {
    try {
        let users = await model.User.find()
        response.send(users)
    } catch (error) {
        console.log(error)
        return response.status(404).send("Users not found.")
    }
})
app.get("/users/:userId", async function (request, response) {
    try {
        let user = await model.User.findOne({_id: request.params.userId})
        if (!user) {
            return response.status(404).send("User not found.")
        }
        response.json(user)
    } catch (error) {
        console.log()
        return response.status(500).send("Server error.")
    }
})
app.post("/users", async function (request, response) {
    try {
        let newUser = new model.User({username: request.body.username, email: request.body.email})
        await newUser.hashPassword(request.body.password)
        const error = await newUser.validateSync()
        if (error) {
            console.log(error)
            return response.status(422).send(error)
        }
        await newUser.save()
        response.status(201).send("New user created.")
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.delete("/users/:userId", async function (request, response) {
    try {
        let isDeleted = await model.User.findOneAndDelete({_id: request.params.userId})
        if (!isDeleted) {
            return response.status(404).send("User not found.")
        }
        response.status(204).send("Deleted user account.")
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.patch("/users/:userId", async function (request, response) {
    try {
        let user = await model.User.findOne({_id: request.params.userId})
        if (!user) {
            return response.status(404).send("User not found.")
        }
        if (request.body.username !== "") {
            user.username = request.body.username
        }
        if (request.body.email !== "") {
            user.email = request.body.email
        }
        if (request.body.password !== "") {
            await user.hashPassword(request.body.password)
        }
        if (request.body.bio !== "") {
            user.bio = request.body.bio
        }
        if (request.body.location !== "") {
            user.location = request.body.location
        }
        if (request.body.displayName !== "") {
            user.displayName = request.body.displayName
        }
        if (request.body.interests !== "") {
            user.interests.push(request.body.interests)
        }
        const error = await user.validateSync()
        if (error) {
            console.log(error)
            return response.status(422).send(error)
        }
        await user.save()
        response.status(204).send()
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.post("/session", async function (request, response) {
    try {
        let user = await model.User.findOne({email: request.body.email})
        if (!user) {
            return response.status(401).send("Authentication failure.")
        }
        let isGoodPassword = await user.verifyPassword(request.body.password)
        if (!isGoodPassword) {
            return response.status(401).send("Authentication failure.")
        }
        request.session.userID = user._id
        response.status(201).send(request.session)
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.listen(8080, function () {
    console.log("Server listening on http://localhost:8080.")
})