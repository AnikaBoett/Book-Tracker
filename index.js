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
        return response.status(500).send("Server error.")
    }
})
app.listen(8080, function () {
    console.log("Server listening on http://localhost:8080.")
})