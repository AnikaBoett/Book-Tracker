const URL = "http://localhost:8080";

Vue.createApp({
    data() {
        return {
            currentPage: "login",
            user: {
                email: "", 
                username: "",
                password: "",
            },
            currentUser: null,

        };
    },
    methods: {
        //Allows users to log into their unique profile
        getSession: async function() {
            let response = await fetch(`${URL}/session`);
            if (response.status === 200) {
                let data = await response.json();
                this.currentUser = data;
                this.currentPage = "homepage"
                //Run the get command for quizzes here 
            } else {
                this.currentPage = "login";
            }
        },
    },
    
    created: function() {
        console.log("Vue app opened");
    }
}).mount("#app");