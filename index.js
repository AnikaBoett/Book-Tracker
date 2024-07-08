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
app.listen(8080, function () {
    console.log("Server listening on http://localhost:8080.")
})