const URL = "http://localhost:8080";

Vue.createApp({
    data() {
        return {
            currentPage: "loading",
            user: {
                username: "",
                email: "", 
                password: "",
            },
            currentUser: null,
            books: [],
            newBook: {
                title: "",
                isbn: 0,
                summary: "",
            },
            profiles: [],
            newProfile: {
                displayName: "",
                bio: "",
                location: "",
                interests: "",
            },
            modal: {
                displayName: "",
                bio: "",
                location: "",
                interests: "",
                index: -1,
            },
            modalBook: {
                title: "",
                isbn: 0,
                summary: "",
                index: -1,
            },
            reviews: [],
            newReview: {
                body: "",
                title: "", 
                book: null,
            },
            modalReview: {
                index: 0,
                body: "",
                title: "",
                book: null,
            },
            comments: [],
            newComment: {
                body: "",
                review: null,
            },
            modalComment: {
                index: 0,
                body: "",
                review: null,
            },
            openModal: false,
            openBookModal: false,
            openDeleteModal: false,
            dialog: false,
            leaveReview: false,
            editReview: false,
            commentFocus: false,
            displayProfile: false,
        };
    },
    methods: {
        switchPage: function (page) {
            this.currentPage = page;
            console.log("displayprofile is", this.displayProfile);
        },

        toggleDeleteModal: function () {
            this.openDeleteModal = !this.openDeleteModal;
            console.log(this.openModal);
        },

        toggleModal: function (index = null) {
            this.openModal = !this.openModal;
            console.log(this.openModal);
            if (index !== null) {
                let current = this.profiles[index];
                this.modal.index = index;
                this.modal.displayName = current.displayName;
                this.modal.bio = current.bio;
                this.modal.location = current.location;
                this.modal.interests = current.interests;
            }
        },

        //POST session for User. Allows new users to register
        registerUser: async function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            let encodedData = 
            "username="
            + encodeURIComponent(this.user.username) + "&email="
            + encodeURIComponent(this.user.email) + "&password="
            + encodeURIComponent(this.user.password);

            let requestOptions = {
                method: "POST",
                body: encodedData,
                headers: myHeaders,
            };

            let response = await fetch(`${URL}/users`, requestOptions);
            
            if (response.status === 201) {
                console.log("Successfully registered user");
                this.loginUser();
            } else {
                console.log("Failed to register the user");
            }
        },

        //Allow users to delete their account if they would like to
        deleteUser: async function (userID) {
            let requestOptions = {
                method: "DELETE",
            };
            let response = await fetch(`${URL}/users/${userID}`, requestOptions);
            if (response.status = 204) {
                console.log("Deleted account successfully");
                this.switchPage('login');
            } else {
                console.log("Failed to delete account");
            }
        },

        //Allows users to log into their unique profile
        getSession: async function() {
            let response = await fetch(`${URL}/session`);
            console.log(response);
            if (response.status === 200) {
                console.log("Successfully retrieved session");
                let data = await response.json();
                this.currentUser = data;
                console.log("The current data is", data);
                this.currentPage = "homepage"
                this.getBooks();
                this.getProfile();
                this.checkForProfile();
                console.log(this.displayProfile, "Profile status");
                this.getReviews();
                this.getComments();
            } else {
                this.currentPage = "splash";
            }
        },

        //Allows users to sign out off their account
        deleteSession: async function() {
            let requestOptions = {
                method: "DELETE",
            };

            let response = await fetch(`${URL}/session`, requestOptions);
            if(response.status == 204) {
                console.log("User was successfully signed out.");
                this.currentPage = "login";
                this.currentUser = null;
            }
        },

        //POST for session. Allows users to log in
        loginUser: async function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        
            let encodedData = "email="
            + encodeURIComponent(this.user.email) + "&password="
            + encodeURIComponent(this.user.password);

            let requestOptions = {
                method: "POST",
                body: encodedData,
                headers: myHeaders,
            };

            let response = await fetch(`${URL}/session`, requestOptions);
            let data = await response.json();
            if (response.status === 201) {
                console.log("User was logged in successfully");
                this.currentUser = data;
                this.user = {
                    username: "",
                    email: "",
                    password: "", 
                }
                this.getSession();
                this.currentPage = "homepage";
            } else {
                console.log("Failed to log in user");
            }
        },
        
        getBooks: async function () {
            let response = await fetch(`${URL}/books`);
            let data = await response.json();
            this.books = data; 
            console.log(data);
        },

        //Allow users to add books to their profile
        addBooks: async function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            
            let encodedData =
            "title="
            + encodeURIComponent(this.newBook.title) + "&isbn="
            + encodeURIComponent(this.newBook.isbn) + "&summary="
            + encodeURIComponent(this.newBook.summary);

            let requestOptions = {
                method: "POST",
                body: encodedData,
                headers: myHeaders,
            };

            let response = await fetch(`${URL}/books`, requestOptions);

            if(response.status === 201) {
                console.log("Successfully added book");
                this.newBook =  {
                    title: "",
                    isbn: 0,
                    summary: "",
                },
                this.getBooks();
            } else {
                console.log("Failed to create book.");
            }
        },

        deleteBook: async function (book) {
            let requestOptions = {
                method: "DELETE",
            };
            console.log("The book is", book);
            let bookID = book._id;
            console.log("Book ID:", bookID);
            let response = await fetch(`${URL}/books/${bookID}`, requestOptions);
            console.log(response);
            if(response.status === 204) {
                this.getBooks();
                console.log("Successfully deleted book");
            } else {
                console.log("Failed to delete book");
            }
        },

        toggleBookModal: function (index = null) {
            this.dialog = true;
            console.log("Book model is", this.openBookModal);
            if (index !== null) {
                let current = this.books[index];
                this.modalBook.index = index;
                this.modalBook.title = current.title;
                this.modalBook.isbn = current.isbn;
                this.modalBook.summary = current.summary;
            }
        },

        editBook: async function (book) {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            let encodedData =
            "title="
            + encodeURIComponent(this.modalBook.title) + "&isbn="
            + encodeURIComponent(this.modalBook.isbn) + "&summary="
            + encodeURIComponent(this.modalBook.summary);

            let requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: encodedData,
            };

            let bookID = this.books[this.modalBook.index]._id;
            console.log(this.books[this.modalBook.index]._id);
            let response = await fetch(`${URL}/books/${bookID}`, requestOptions);

            if (response.status === 204) {
                console.log("Successfully updated the book");
                this.getBooks();
                this.toggleBookModal();
                this.dialog = false;
            } else {
                console.log("Failed to update the book");
            }
        },
        
        //GET request for profile information
        getProfile: async function() {
            let response = await fetch(`${URL}/profiles`);
            let data = await response.json();
            this.profiles = data;
            this.checkForProfile();
            console.log(data);
            console.log("Successfully retrieved profile");
        },

        //POST request for profile information 
        createProfile: async function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            let encodedData =
            "&displayName="
            + encodeURIComponent(this.newProfile.displayName) + "&bio="
            + encodeURIComponent(this.newProfile.bio) + "&location="
            + encodeURIComponent(this.newProfile.location) + "&interests="
            + encodeURIComponent(this.newProfile.interests);

            let requestOptions = {
                method: "POST", 
                headers: myHeaders,
                body: encodedData,
            };

            let response = await fetch(`${URL}/profiles`, requestOptions);
            if (response.status === 201) {
                console.log("User profile successfully created");
                this.newProfile = {
                    displayName: "",
                    bio: "",
                    location: "",
                    interests: "",
                };
                this.getProfile();
            } else {
                console.log("Failed to create user profile");
            }
        },

        //PUT request for profile
        editProfile: async function (profile) {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            let encodedData =
            "displayName="
            + encodeURIComponent(this.modal.displayName) + "&bio="
            + encodeURIComponent(this.modal.bio) + "&location="
            + encodeURIComponent(this.modal.location) + "&interests="
            + encodeURIComponent(this.modal.interests);

            let requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: encodedData,
            };

            let profID = this.profiles[this.modal.index]._id;

            let response = await fetch(`${URL}/profiles/${profID}`,
                requestOptions
            );

            if (response.status === 204) {
                console.log("Successfully updated user info");
                this.toggleModal();
                this.getProfile();
            } else {
                console.log("Failed to update the user's info");
            }
        },

        checkForProfile: function () {
            let profileNum = 0;
            this.displayProfile = false;
            console.log("running check for profile");
            for (p in this.profiles) {
                console.log(this.profiles[p].owner, this.currentUser._id);
                if (this.profiles[p].owner === this.currentUser._id) {
                    profileNum = 1;

                    console.log("TESTING")
                    console.log("User profile exists");
                }
            }
            console.log(profileNum);
            if (profileNum === 0) {
                this.displayProfile = false;
                console.log("no user profiles exist")
            } else {
                console.log("set display profile to true", this.displayProfile);
                this.displayProfile = true;
            }
        },

        //DELETE for profile 
        deleteProfile: async function (index) {
            let requestOptions = {
                method: "DELETE",
            };

            let profileID = this.profiles[index]._id;
            let response = await fetch(`${URL}/profiles/${profileID}`, requestOptions);
            if(response.status == 204) {
                this.profiles.splice(index, 1);
                console.log("Profile successfully deleted");
                this.checkForProfile();
            } else {
                alert("Unable to find or delete profile");
            }
        },

        //
        //REVIEWS Methods
        //
        getReviews: async function () {
            let response = await fetch(`${URL}/reviews`);
            let data = await response.json();
            this.reviews = data;
            console.log(data);
            console.log("Successfully retreived reviews");
            for (let review of this.reviews) {
                review.newComment = "";

            }
            console.log(this.reviews);
        },

        beginReview: function (book) {
            this.leaveReview = true;
            this.newReview.book = book._id;
            console.log("The book ID is", this.newReview.book);
        },

        createReview: async function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            let encodedData =
            "body="
            + encodeURIComponent(this.newReview.body) + "&title="
            + encodeURIComponent(this.newReview.title) + "&book="
            + encodeURIComponent(this.newReview.book);

            console.log(this.newReview.book, "testing");
            let requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: encodedData,
            };

            let response = await fetch (`${URL}/reviews`, requestOptions);
            console.log("The response is", response);
            if (response.status === 201) {
                console.log("New review created successfully");
                this.getReviews();
                this.leaveReview = false;
            } else {
                console.log("Failed to create the review for the book");
            }
        },

        //Delete a review
        deleteReview: async function (index) {
            let requestOptions = {
                method: "DELETE",
            };

            let reviewID = this.reviews[index]._id;
            let response = await fetch(`${URL}/reviews/${reviewID}`, requestOptions);
            if(response.status == 204) {
                this.reviews.splice(index, 1);
                console.log("Review was successfully deleted.");
            } else {
                alert("Unable to find or delete review");
            }
        },

        toggleEditReviewModal: function (index = null) {
            this.editReview = true;
            console.log("Review model is", this.editReview);
            if (index !== null) {
                let current = this.reviews[index];
                this.modalReview.index = index;
                console.log(current);
                this.modalReview.title = current.title;
                this.modalReview.body = current.body;
                this.modalReview.book = current.book;
            }
        },

        editTheReview: async function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            let encodedData = "body="
            + encodeURIComponent(this.modalReview.body) + "&title="
            + encodeURIComponent(this.modalReview.title) + "&book="
            + encodeURIComponent(this.modalReview.book);

            let requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: encodedData,
            };

            let reviewID = this.reviews[this.modalReview.index]._id;

            let response = await fetch(`${URL}/reviews/${reviewID}`, requestOptions);

            if (response.status === 204) {
                console.log("Review successfully updated");
                this.toggleEditReviewModal();
                this.getReviews();
                this.editReview = false;
            } else {
                console.log("Error while updating the user's info");
            }
        },

        getComments: async function () {
            let response = await fetch(`${URL}/comments`);
            let data = await response.json();
            this.comments = data;
            console.log(data);
            console.log("Successfully retrieved comments");
        },

        createComment: async function (review) {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            console.log(review._id);
            this.newComment.review = review._id;
            let encodedData = 
            "body="
            + encodeURIComponent(review.newComment) + "&review="
            + encodeURIComponent(this.newComment.review);

            let requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: encodedData,
            };

            let response = await fetch(`${URL}/comments`, requestOptions);
            console.log("The comments are", response);
            if (response.status === 201) {
                console.log("New comment created");
                this.getComments();
                this.newComment = {
                    body: "",
                    review: null,
                };
                review.newComment = "";
            } else {
                console.log("Failed to create a comment");
            }
        },

        deleteComment: async function (index) {
            let requestOptions = {
                method: "DELETE",
            };

            let commentID = this.comments[index]._id;
            let response = await fetch(`${URL}/comments/${commentID}`, requestOptions);
            if(response.status == 204) {
                this.comments.splice(index, 1);
                console.log("Successfully deleted comment");
            } else {
                alert("Unable to find or delete review");
            }
        },

        launchEditComment: function (index = null) {
            if (index !== null) {
                let current = this.comments[index];
                this.modalComment.index = index;
                console.log(current);
                this.modalComment.body = current.body;
                this.modalReview.review = current.review;
            }            
        },

        editComment: async function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            let encodedData = 
            "body="
            + encodeURIComponent(this.modalComment.body) + "&review="
            + encodeURIComponent(this.modalComment.review);

            let requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: encodedData,
            };

            let commentID = this.comments[this.modalComment.index]._id;
            let response = await fetch(`${URL}/comments/${commentID}`, requestOptions);

            if(response.status === 204) {
                console.log("Comment successfully updated");
                this.getComments();
                this.modalComment = {
                    index: 0,
                    body: "",
                    review: null,
                }
            } else {
                console.log("Error while editing comment");
            }
        },
    },
    
    created: function() {
        console.log("Vue app opened");
        this.getSession();
    },
}).use(Vuetify.createVuetify()).mount("#app");