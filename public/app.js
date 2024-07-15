const URL = "http://localhost:8080";

Vue.createApp({
    data() {
        return {
            currentPage: "login",
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
            openModal: false,
        };
    },
    methods: {
        switchPage: function (page) {
            this.currentPage = page;
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
/*
        //Allow users to delete their account if they would like to
        deleteUser: async function (userID) {
            let requestOptions = {
                method: "DELETE",
            };
            let response = await fetch(`${URL}/users/${userID}`, requestOptions);
            if (response.status = 204) {
                console.log("Deleted account successfully");
            } else {
                console.log("Failed to delete account");
            }
        },
*/
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
            } else {
                this.currentPage = "login";
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
                    email: "",
                    password: "",
                };
                this.currentPage = "homepage";
                this.getProfile();
            } else {
                console.log("Failed to log in user");
            }
        },

        /*
        updateUserInfo: async function() {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            let encodedData = 
            "username=" 
            + encodeURIComponent(this.currentUser.username) + "&email=" 
            + encodeURIComponent(this.currentUser.email) + "&password=" 
            + encodeURIComponent(this.currentUser.password) + "&bio="
            + encodeURIComponent(this.currentUser.bio) + "&location="
            + encodeURIComponent(this.currentUser.location) + "&displayName="
            + encodeURIComponent(this.currentUser.displayName) + "&interests="
            + encodeURIComponent(this.currentUser.interests);

            let requestOptions = {
                method: "PATCH",
                body: encodedData,
                headers: myHeaders,
            };

            let response = await fetch(`${URL}/users/${this.currentUser.userID}`,
                requestOptions
            );
            
            if (response.status === 204) {
                console.log("Successfully updated user info");
            } else {
                console.log("Failed to update the user's info");
            }
        },
        */
        
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
        
        //GET request for profile information
        getProfile: async function() {
            let response = await fetch(`${URL}/profiles`);
            let data = await response.json();
            this.profiles = data;
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
            "&displayName="
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
            } else {
                alert("Unable to find or delete profile");
            }
        },
    },
    
    created: function() {
        console.log("Vue app opened");
        this.getSession();
    },
}).use(Vuetify.createVuetify()).mount("#app");