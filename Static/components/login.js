export default {
    template: 
    `<div class="container mt-5 mb-5">
        <div class="card mx-auto p-5 bg-light" style="max-width: 400px;">
            <h2 class="text-center mb-4">Login</h2>
            <div class="mb-3">
                <label for="user_username" class="form-label">Username</label>
                <input type="text" class="form-control" id="user_username" placeholder="Username" v-model="login_details.username">
            </div>
            <div class="mb-3">
                <label for="user_password" class="form-label">Password</label>
                <input type="password" class="form-control" id="user_password" placeholder="Password" v-model="login_details.password">
            </div>
            <div class="text-center">
                <button type="button" class="btn btn-primary w-100" @click="login">Login</button>
            </div>
            <p class="text-center mt-3"> 
                New User? <button type="button" class="btn btn-link p-0" @click="register">Register</button>
            </p>
        </div>
    </div>`,
    data() {
        return {
            login_details: {
                username: null,
                password: null
            },
        }
    },
    methods: {
        async login() {
            try {
                const response = await fetch('/user_login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.login_details)
                });
    
                if (response.ok) {
                    const response_data = await response.json();
                    localStorage.setItem('auth_token', response_data.auth_token);
                    localStorage.setItem('role', response_data.role);
    
                    if (response_data.role.includes('admin')) {
                        this.$router.push('/admin_dashboard');
                    } else if (response_data.role.includes('user')) {
                        this.$router.push('/user_dashboard');
                    }
                } else {
                    const error = await response.json();
                    alert(error.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login. Please try again.');
            }
        },
        register() {
            this.$router.push('/register');
        },
    },
}
