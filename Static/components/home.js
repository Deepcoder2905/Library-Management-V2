export default {
    template: 
    `
    <div>
        <div class="container mt-5">
            <div class="bg-secondary p-5 rounded">
                <h1 class="text-white fw-bold">Welcome to Bookzy</h1>
                <p class="lead text-light fw-light">This platform allows user to request/read/return differnet and numerous numbers of e-books.</p>
                <hr class="border-light">
                <button class="btn btn-primary btn-lg" @click="register">Get Started</button>
            </div>
        </div>
    </div>`,
    data() {
        return {
            message: 'Welcome to the Home Page'
        }
    },
    methods: {
        register() {
            this.$router.push('/register');
        }
    },
}

