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
app.put("/books/:bookId", AuthMiddleware, async function (request, response) {
    try {
        let book = await model.Book.findOne({_id: request.params.bookId})
        if (!book) {
            console.log("Book not found.")
            return response.status(404).send("Book not found.")
        }
        if (request.session.userID.toString() !== book.owner._id.toString()) {
            return response.status(404).send("Unauthenticated.")
        }
        book.title = request.body.title
        book.isbn = parseInt(request.body.isbn)
        book.summary = request.body.summary
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
app.get("/profiles", async function (request, response) {
    try {
        let profiles = await model.Profile.find()
        response.send(profiles)
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.get("/profiles/:profileId", async function (request, response) {
    try {
        let profile = await model.Profile.findOne({_id: request.params.profileId})
        if (!profile) {
            console.log("Profile not found.")
            return response.status(404).send("Profile not found.") 
        }
        response.json(profile)
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.post("/profiles", async function (request, response) {
    try {
        let newProfile = new model.Profile({owner: request.session.userID, displayName: request.body.displayName, bio: request.body.bio, location: request.body.location, interests: request.body.interests})
        let error = newProfile.validateSync()
        if (error) {
            return response.status(422).json(error.errors)
        }
        await newProfile.populate("owner", "username")
        await newProfile.save()
        response.status(201).send("Profile created.")
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.delete("/profiles/:profileId", AuthMiddleware, async function (request, response) {
    try {
        let isDeleted = await model.Profile.findOneAndDelete({_id: request.params.profileId, owner: request.session.userID})
        if (!isDeleted) {
            return response.status(404).send("Profile not found.")
        }
        response.status(204).send("Removed profile.")
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.put("/profiles/:profileId", AuthMiddleware, async function (request, response) {
    try {
        let profile = await model.Profile.findOne({_id: request.params.profileId})
        if (!profile) {
            console.log("Profile not found.")
            return response.status(404).send("Profile not found.")
        }
        if (request.session.userID.toString() !== profile.owner._id.toString()) {
            return response.status(404).send("Unauthenticated.")
        }
        profile.displayName = request.body.displayName
        profile.bio = request.body.bio
        profile.location = request.body.location
        profile.interests = request.body.interests
        const error = await profile.validateSync()
        if (error) {
            console.log(error)
            return response.status(422).send(error)
        }
        await profile.save()
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
        request.session.username = user.username
        request.session.email = user.email
        response.status(201).send(request.session)
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.get("/session", async function (request, response) {
    try {
        if (request.session && request.session.userID) {
            let user = await model.User.findOne({_id: request.session.userID})
            if (user) {
                return response.status(200).json(user)
            } else {
                return response.status(401).send("Authentication failure.")
            }
        } else {
            return response.status(401).send("Not authenticated.")
        }
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.delete("/session", function (request, response) {
    request.session.userID = undefined
    request.session.username = undefined
    request.session.email = undefined
    response.status(204).send("Logged out.")
})
app.get("/reviews", async function (request, response) {
    try {
        let reviews = await model.Review.find()
        response.send(reviews)
    } catch (error) {
        console.log(error)
        return response.status(404).send("Users not found.")
    }
})
app.get("/reviews/:reviewId", async function (request, response) {
    try {
        let review = await model.Review.findOne({_id: request.params.reviewId})
        if (!review) {
            console.log("Review not found.")
            return response.status(404).send("Review not found.") 
        }
        response.json(review)
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.post("/reviews", async function (request, response) {
    try {
        let newReview = new model.Review({owner: request.session.userID, body: request.body.body, title: request.body.title, book: request.body.book})
        let error = newReview.validateSync()
        if (error) {
            return response.status(422).json(error.errors)
        }
        await newReview.populate("owner", "username")
        await newReview.populate("book", "title isbn summary")
        await newReview.save()
        response.status(201).send("Review created.")
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.delete("/reviews/:reviewId", AuthMiddleware, async function (request, response) {
    try {
        let isDeleted = await model.Review.findOneAndDelete({_id: request.params.reviewId, owner: request.session.userID})
        if (!isDeleted) {
            return response.status(404).send("Review not found.")
        }
        response.status(204).send("Removed review.")
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.put("/reviews/:reviewId", AuthMiddleware, async function (request, response) {
    try {
        let review = await model.Review.findOne({_id: request.params.reviewId})
        if (!review) {
            console.log("Review not found.")
            return response.status(404).send("Review not found.")
        }
        if (request.session.userID.toString() !== review.owner._id.toString()) {
            return response.status(404).send("Unauthenticated.")
        }
        review.title = request.body.title
        review.body = request.body.body
        const error = await review.validateSync()
        if (error) {
            console.log(error)
            return response.status(422).send(error)
        }
        await review.save()
        response.status(204).send()
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.get("/comments", async function (request, response) {
    try {
        let comments = await model.Comment.find()
        response.send(comments)
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.get("/comments/:commentId", async function (request, response) {
    try {
        let comment = await model.Comment.findOne({_id: request.params.commentId})
        if (!comment) {
            console.log("Comment not found.")
            return response.status(404).send("Comment not found.") 
        }
        response.json(comment)
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.post("/comments", async function (request, response) {
    try {
        let newComment = new model.Comment({owner: request.session.userID, body: request.body.body, review: request.body.review})
        let error = newComment.validateSync()
        if (error) {
            return response.status(422).json(error.errors)
        }
        await newComment.populate("owner", "username")
        await newComment.populate("review", "title body book")
        await newComment.save()
        let commentedReview = await model.Review.findOne({_id: newComment.review._id.toString()})
        commentedReview.comments.push(newComment._id)
        await commentedReview.save()
        response.status(201).send("Comment created.")
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.delete("/comments/:commentId", AuthMiddleware, async function (request, response) {
    try {
        let comment = await model.Comment.findOne({_id: request.params.commentId})
        let commentedReview = await model.Review.findOne({_id: comment.review})
        let index = commentedReview.comments.indexOf(request.params.commentId)
        commentedReview.comments.splice(index, 1)
        await commentedReview.save()
        let isDeleted = await model.Comment.findOneAndDelete({_id: request.params.commentId, owner: request.session.userID})
        if (!isDeleted) {
            return response.status(404).send("Comment not found.")
        }
        response.status(204).send("Removed comment.")
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.put("/comments/:commentId", AuthMiddleware, async function (request, response) {
    try {
        let comment = await model.Comment.findOne({_id: request.params.commentId})
        if (!comment) {
            console.log("Comment not found.")
            return response.status(404).send("Comment not found.")
        }
        if (request.session.userID.toString() !== comment.owner._id.toString()) {
            return response.status(404).send("Unauthenticated.")
        }
        comment.body = request.body.body
        const error = await comment.validateSync()
        if (error) {
            console.log(error)
            return response.status(422).send(error)
        }
        await comment.save()
        response.status(204).send()
    } catch (error) {
        console.log(error)
        return response.status(500).send("Server error.")
    }
})
app.listen(8080, function () {
    console.log("Server listening on http://localhost:8080.")
})