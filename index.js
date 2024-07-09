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
        response.status(404).send("Users not found.")
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
        response.status(500).send("Server error.")
    }
})
app.listen(8080, function () {
    console.log("Server listening on http://localhost:8080.")
})