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


        };
    },
    methods: {
        switchPage: function (page) {
            this.currentPage = page;
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
            if (response.status === 200) {
                let data = await response.json();
                this.currentUser = data;
                this.currentPage = "homepage"
                //Run the get command for getBooks here 
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
                this.currentPage = "login";
                this.currentUser = null;
            }
        },

        //POST for session. Allows users to log in
        loginUser: async function () {
            console.log("Ran loginUser")
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
                };
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


    },
    
    created: function() {
        console.log("Vue app opened");
        //this.getSession();
    },
}).use(Vuetify.createVuetify()).mount("#app");