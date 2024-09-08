export default {
  template: `
    <div class="container mt-5">
      <h1>Welcome, {{ userName }}!</h1>
      <h2 class="mb-4 text-center">User Dashboard</h2>

      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card bg-info text-white text-center">
            <div class="card-body">
              <h3 class="card-title">{{ userBooks.length }}</h3>
              <p class="card-text">My Books</p>
              <button class="btn btn-light" @click="showTable('mybooks')">View My Books</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-warning text-white text-center">
            <div class="card-body">
              <h3 class="card-title">{{ requestedBooks.length }}</h3>
              <p class="card-text">Requested Books</p>
              <button class="btn btn-light" @click="showTable('requestedbooks')">View Requested Books</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-success text-white text-center">
            <div class="card-body">
              <h3 class="card-title">{{ availableBooks.length }}</h3>
              <p class="card-text">All Books</p>
              <button class="btn btn-light" @click="showTable('allbooks')">View All Books</button>
            </div>
          </div>
        </div>
      </div>

      <!-- My Books Table -->
      <div v-if="currentTable === 'mybooks'" class="mb-4">
        <h3>My Books</h3>
        <table class="table table-hover">
          <thead class="thead-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Read</th>
              <th>Rate and feedback</th>
              <th>Return Book</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in userBooks" :key="book.id">
              <td>{{ book.id }}</td>
              <td>{{ book.title }}</td>
              <td>{{ book.author }}</td>
              <td>
                <button class="btn btn-primary btn-sm" @click="viewContent(book.id)">View Content</button>
              </td>
              <td>
                <button class="btn btn-info btn-sm" @click="openRatingModal(book.id)">Rate & Feedback</button>
              </td>
              <td>
                <button class="btn btn-danger btn-sm" @click="returnBook(book.id)">Return</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Content Modal -->
      <div v-if="showContentModal" class="modal" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Book Content</h5>
              <button type="button" class="close" @click="showContentModal = false">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>{{ bookContent }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Modal -->
      <div v-if="showRatingModal" class="modal" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Rate & Feedback</h5>
              <button type="button" class="close" @click="showRatingModal = false">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitRatingFeedback">
                <div class="form-group">
                  <label for="rating">Rating (1-5)</label>
                  <input type="number" class="form-control" id="rating" v-model="rating" min="1" max="5" required>
                </div>
                <br>
                <div class="form-group">
                  <label for="feedback">Feedback</label>
                  <textarea class="form-control" id="feedback" v-model="feedback" rows="3" required></textarea>
                </div>
                <br>
                <button type="submit" class="btn btn-primary">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Requested Books Table -->
      <div v-if="currentTable === 'requestedbooks'" class="mb-4">
        <h3>Requested Books</h3>
        <table class="table table-hover">
          <thead class="thead-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in requestedBooks" :key="book.id">
              <td>{{ book.id }}</td>
              <td>{{ book.title }}</td>
              <td>{{ book.author }}</td>
              <td :class="getStatusClass(book.status)">{{ book.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- All Books Table -->
      <div v-if="currentTable === 'allbooks'" class="mb-4">
        <h3>All Books</h3>
        <input
          type="text"
          class="form-control mb-3"
          placeholder="Search by section or book name"
          v-model="searchQuery"
        />
        <table class="table table-hover">
          <thead class="thead-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Section</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in filteredBooks" :key="book.id">
              <td>{{ book.id }}</td>
              <td>{{ book.title }}</td>
              <td>{{ book.author }}</td>
              <td>{{ book.section_name }}</td>
              <td>
                <button class="btn btn-primary btn-sm" @click="requestBook(book.id)">Request</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  data() {
    return {
      userName: '',
      userBooks: [],
      requestedBooks: [],
      availableBooks: [],
      currentTable: '',
      searchQuery: '',
      showContentModal: false,
      showRatingModal: false,
      bookContent: '',
      currentBookId: null,
      rating: 0,
      feedback: '',
      token: localStorage.getItem('auth_token'),
      role: localStorage.getItem('role'),
    };
  },

  async mounted() {
    await this.fetchUserName();
    await this.fetchUserBooks();
    await this.fetchRequestedBooks();
    await this.fetchAvailableBooks();
  },

  methods: {
    async fetchUserName() {
      const response = await fetch(`/user_name`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.token,
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        this.userName = data.username;
      } else {
        alert('Failed to fetch user name');
      }
    },

    async fetchUserBooks() {
      try {
        const response = await fetch('/user_books', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.userBooks = data.books;
        } else {
          alert('Failed to fetch user books');
        }
      } catch (error) {
        alert('An unexpected error occurred');
      }
    },

    async fetchRequestedBooks() {
      try {
        const response = await fetch('/requested_books', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.requestedBooks = data.books;
        } else {
          alert('Failed to fetch requested books');
        }
      } catch (error) {
        alert('An unexpected error occurred');
      }
    },

    async viewContent(bookId) {
      try {
        const response = await fetch(`/book_content/${bookId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
    
        if (response.ok) {
          const data = await response.json();
          this.bookContent = data.content;
          this.showContentModal = true;
        } else {
          console.error('Failed to fetch book content:', response.status, response.statusText);
          alert('Failed to fetch book content. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching book content:', error);
        alert('An unexpected error occurred while fetching book content.');
      }
    },

    async openRatingModal(bookId) {
      this.currentBookId = bookId;
      try {
        const response = await fetch(`/book_rating_feedback/${bookId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.rating = data.rating;
          this.feedback = data.feedback;
        } else {
          this.rating = 0;
          this.feedback = '';
        }
        this.showRatingModal = true;
      } catch (error) {
        alert('An unexpected error occurred');
      }
    },

    async submitRatingFeedback() {
      try {
        const response = await fetch('/rate_and_feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify({
            book_id: this.currentBookId,
            rating: this.rating,
            feedback: this.feedback,
          }),
        });

        if (response.ok) {
          this.showSuccessAlert('Rating and feedback submitted successfully');
          this.showRatingModal = false;
        } else {
          alert('Failed to submit rating and feedback');
        }
      } catch (error) {
        alert('An unexpected error occurred');
      }
    },

    async fetchAvailableBooks() {
      try {
        const response = await fetch('/available_books', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
    
        if (response.ok) {
          const data = await response.json();
          this.availableBooks = data.available_books_info;
        } else {
          alert('Failed to fetch available books');
        }
      } catch (error) {
        alert('An unexpected error occurred');
      }
    },

    showTable(tableName) {
      this.currentTable = tableName;
    },

    async returnBook(bookId) {
      try {
        const response = await fetch(`/return_book/${bookId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });

        if (response.ok) {
          this.showSuccessAlert('Book returned successfully');
          await this.fetchUserBooks();
        } else {
          alert('Failed to return book');
        }
      } catch (error) {
        alert('An unexpected error occurred');
      }
    },

    async requestBook(bookId) {
      try {
        const response = await fetch(`/request_book/${bookId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });

        if (response.ok) {
          this.showSuccessAlert('Book requested successfully');
          await this.fetchAvailableBooks();
        } else {
          alert('Failed to request book');
        }
      } catch (error) {
        alert('An unexpected error occurred');
      }
    },

    async cancelRequest(bookId) {
      try {
        const response = await fetch(`/cancel_request/${bookId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
    
        if (response.status==200) {
          const response_data = await response.json();
          this.showSuccessAlert(response_data.message);
          await this.fetchRequestedBooks();
        } else {
          alert('Failed to cancel book request');
        }
      } catch (error) {
        alert('An unexpected error occurred');
      }
    },

    getStatusClass(status) {
      return {
        'text-success': status === 'Approved',
        'text-warning': status === 'Pending',
        'text-danger': status === 'Rejected',
      };
    },
      showSuccessAlert(message) {
        Swal.fire({
          title: "Success!",
          text: message,
          icon: "success",
          button: "OK",
        });
      },
  },

  computed: {
    filteredBooks() {
      if (!this.searchQuery) {
        return this.availableBooks;
      }
      const query = this.searchQuery.toLowerCase();
      return this.availableBooks.filter(book => 
        (book.title && book.title.toLowerCase().includes(query)) || 
        (book.author && book.author.toLowerCase().includes(query)) ||
        (book.section_name && book.section_name.toLowerCase().includes(query))
      );
    },
  },
};

  