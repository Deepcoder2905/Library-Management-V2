export default {
    template: `
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="container-fluid">
              <a class="navbar-brand" href="/">Bookzy</a>
              
              <!-- Navbar toggler for mobile -->
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
              </button>
  
              <!-- Navbar links -->
              <div class="collapse navbar-collapse" id="navbarNav">
                  <ul class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll">
                      <li class="nav-item" v-if="!is_logged_in">
                          <button class="nav-link" @click="home">Home</button>
                      </li>
                      <li class="nav-item" v-if="!is_logged_in">
                          <button class="nav-link" @click="admin_login">Admin Login</button>
                      </li>
                      <li class="nav-item" v-if="!is_logged_in">
                          <button class="nav-link" @click="login">Login</button>
                      </li>
                      <li class="nav-item" v-if="!is_logged_in">
                          <button class="nav-link" @click="register">Register</button>
                      </li>
                      <li class="nav-item" v-if="is_logged_in && role && role.includes('admin')">
                          <button class="nav-link" @click="dashboard">Dashboard</button>
                      </li>
                      <li class="nav-item" v-if="is_logged_in && role && role.includes('user')">
                          <button class="nav-link" @click="dashboard">Dashboard</button>
                      </li>                   
                      <li class="nav-item" v-if="is_logged_in">
                          <button class="nav-link" @click="logout">Logout</button>
                      </li>
                  </ul>
              </div>
          </div>
      </nav>`,
    data() {
        return {
            role: localStorage.getItem('role'),
            token: localStorage.getItem('auth_token'),
        };
    },
    methods: {
        logout() {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('role');
            this.$router.push('/');
        },
        dashboard() {
            if (this.role.includes('admin')) {
                this.$router.push('/admin_dashboard');
            } else if (this.role.includes('user')) {
                this.$router.push('/user_dashboard');
            } else {
                console.log('Role not found');
            }
        },
        admin_login() {
            this.$router.push('/admin_login');
        },
        home() {
            this.$router.push('/');
        },
        register() {
            this.$router.push('/register');
        },
        login() {
            this.$router.push('/login');
        },
    },
    computed: {
        is_logged_in() {
            return localStorage.getItem('auth_token') !== null;
        }
    },
};
