const express = require("express")
const session = require("express-session")
const model = require("./model")
require("dotenv").config()
const app = express()
app.use(express.static("public"))
app.use(session({secret: "dsakdsnknqewknjkdfhnwian", saveUninitialized: true, resave: false}))
app.use(express.urlencoded({extended: true}))
async function AuthMiddleware(request, response, next) {
    if (request.session && request.session.userID) {
        let user = await model.User.findOne({_id: request.session.userID})
        if (!user) {
            return response.status(401).send("Unauthenticated.")
        }
        request.user = user
        next()
    } else {
        return response.status(401).send("Unauthenticated.")
    }
}
app.get("/books", async function (request, response) {
    try {
        let books = await model.Book.find()
        response.send(books)
    } catch (error) {
        console.log(error)
        return response.status(404).send("Users not found.")
    }
})
app.get("/books/:bookId", async function (request, response) {
    try {
        let book = await model.Book.findOne({_id: request.params.bookId})
        if (!book) {
            console.log("Book not found.")
            return response.status(404).send("Book not found.") 
        }
        response.json(book)
    } catch (error) {
        console.log(error)
        return response.status(404).send("Users not found.")
    }
})
app.post("/books", async function (request, response) {
    try {
        let newBook = new model.Book({title: request.body.title, isbn: parseInt(request.body.isbn), summary: request.body.summary, owner: request.session.userID})
        let error = newBook.validateSync()
        if (error) {
            return response.status(422).json(error.errors)
        }
        await newBook.populate("owner", "username")
        await newBook.save()
        response.status(201).send("Book created.")
    } catch (error) {
        console.log(error)
        return response.status(400).send("Book cannot be created.")
    }
})
app.delete("/books/:bookId", AuthMiddleware, async function (request, response) {
    try {
        let isDeleted = await model.Book.findOneAndDelete({_id: request.params.bookId, owner: request.session.userID})
        if (!isDeleted) {
            return response.status(404).send("Book not found.")
        }
        response.status(204).send("Removed book.")
    } catch (error) {
        console.log(error)
        return response.status(500).send(error)
    }
})
app.patch("/books/:bookId", AuthMiddleware, async function (request, response) {
    try {
        let book = await model.Book.findOne({_id: request.params.bookId})
        if (!book) {
            console.log("Book not found.")
            return response.status(404).send("Book not found.")
        }
        if (request.session.userID.toString() !== book.owner._id.toString()) {
            return response.status(404).send("Unauthenticated.")
        }
        if (request.body.title !== "") {
            book.title = request.body.title
        }
        if (request.body.isbn !== "") {
            book.isbn = request.body.isbn
        }
        if (request.body.summary !== "") {
            book.summary = request.body.summary
        }
        const error = await book.validateSync()
        if (error) {
            console.log(error)
            return response.status(422).send(error)
        }
        await book.save()
        response.status(204).send()
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
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
app.delete("/users/:userId", AuthMiddleware, async function (request, response) {
    try {
        if (request.user._id.toString() !== request.params.userId) {
            return response.status(403).send("Not Authenticated.")
        }
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
app.patch("/users/:userId", AuthMiddleware, async function (request, response) {
    try {
        if (request.user._id.toString() !== request.params.userId) {
            return response.status(403).send("Not Authenticated.")
        }
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
app.get("/session", async function (request, response) {
    response.send(request.session)
})
app.delete("/session", function (request, response) {
    request.session.userID = undefined
    request.user = undefined
    response.status(204).send("Logged out.")
})
app.listen(8080, function () {
    console.log("Server listening on http://localhost:8080.")
})