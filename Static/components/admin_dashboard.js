export default {
  template: `
  <div class="container mt-5">
    <h2 class="mb-4 text-center">Librarian Dashboard</h2>

    <div class="row mb-4 text-center">
      <div class="col-md-3">
        <div class="card shadow-sm bg-primary text-white">
          <div class="card-body">
            <h3 class="card-title">{{ total_users }}</h3>
            <p class="card-text">Total Users</p>
            <button class="btn btn-light" @click="showTable('users')">View Users</button>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm bg-success text-white">
          <div class="card-body">
            <h3 class="card-title">{{ total_books }}</h3>
            <p class="card-text">Total Books</p>
            <button class="btn btn-light" @click="showTable('allbooks')">View Books</button>
            <button class="btn btn-primary " @click="openAddBookModal">Add Books</button>
            <br>
            <button class="btn btn-warning mt-2" @click="checkOverdueBooks">Overdue Books</button>
                
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm bg-warning text-white">
          <div class="card-body">
            <h3 class="card-title">{{ total_sections }}</h3>
            <p class="card-text">Total Sections</p>
            <button class="btn btn-light" @click="showTable('sections')">View Sections</button>
            <button class="btn btn-primary" @click="showAddSectionModal">Add Section</button>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card shadow-sm bg-secondary text-white">
          <div class="card-body">
            <h2 class="card-text">Graphs</h2>
            <button @click="showGraph('rating')" class="btn btn-primary">Show Rating Graph</button>
            <button @click="showGraph('section')" class="btn btn-success">Show Section Book Graph</button>

          </div>
        </div>
      </div>
      <div v-if="currentGraph === 'rating'">
      <img src="/static/images/rating_graph.png" alt="Rating Graph" class="img-fluid mt-3" />
    </div>
    <div v-if="currentGraph === 'section'">
      <img src="/static/images/section_book_count_graph.png" alt="Section Book Count Graph" class="img-fluid mt-3" />
    </div>
      
      <div class="col-md-3">
        <div class="card shadow-sm bg-danger text-white">
          <div class="card-body">
            <h3 class="card-title">{{ pending_requests }}</h3>
            <p class="card-text">Requests</p>
            <button class="btn btn-light" @click="showTable('requests')">View Requests</button>
            <button class="btn btn-info mt-2" @click="showTable('issuedBooks')">Issued Books</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sections Table -->
    <div v-if="currentTable === 'sections'" class="mb-4">
      <h3>Sections</h3>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Delete Section</th>
            <th> Edit Section </th>
            
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in sections" :key="section.id">
            <td>{{ section.id }}</td>
            <td>{{ section.name }}</td>
            <td>{{ section.description }}</td>
            <td>
              <button class="btn btn-danger" @click="deleteSection(section.id)">Delete</button>
            </td>
            <td>
              <button class="btn btn-warning" @click="editSection(section.id)">Edit</button>
            </td>
            
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Books in All Sections Table -->
    <div v-if="currentTable === 'allbooks'" class="mb-4">
      <h3>All Books</h3>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Section</th>
            <th>Delete Book</th>
            <th>Edit Book</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.id }}</td>
            <td>{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td>{{ getSectionName(book.section_id) }}</td>
            <td>
              <button class="btn btn-danger" @click="deleteBook(book.id)">Delete</button>
            </td>
            <td>
              <button class="btn btn-warning" @click="openEditBookModal(book)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Users Table -->
    <div v-if="currentTable === 'users'" class="mb-4">
      <h3>Users</h3>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td :class="user.active ? 'text-success' : 'text-danger'">{{ user.active ? 'Active' : 'Inactive' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Book Requests Table -->
    <div v-if="currentTable === 'requests'" class="mb-4">
      <h3>Book Requests</h3>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Book ID</th>
            <th>User ID</th>
            <th>Status</th>
            <th> Accept </th>
            <th> Reject </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in bookRequests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.book_id }}</td>
            <td>{{ request.user_id }}</td>
            <td :class="{'text-warning': request.status === 'pending', 'text-success': request.status === 'approved', 'text-danger': request.status === 'rejected'}">{{ request.status }}</td>
            <td>
            <button v-if="request.status === 'pending'" class="btn btn-success btn-sm mr-2" @click="acceptRequest(request.id)">Accept</button>
            </td>
            <td>
            <button v-if="request.status === 'pending'" class="btn btn-danger btn-sm" @click="rejectRequest(request.id)">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Section Modal -->
    <div class="modal" tabindex="-1" role="dialog" v-if="showModal" style="display: block !important; background-color: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Section</h5>
            <button type="button" class="close" @click="closeAddSectionModal">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addSection">
              <div class="form-group">
                <label for="sectionName">Section Name</label>
                <input type="text" class="form-control" id="sectionName" v-model="newSection.name" required>
              </div>
              <br>
              <div class="form-group">
                <label for="sectionDescription">Description</label>
                <textarea class="form-control" id="sectionDescription" v-model="newSection.description"></textarea>
              </div>
              <br>
              <button type="submit" class="btn btn-primary">Add Section</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Edit Section Modal -->
    <div class="modal" tabindex="-1" role="dialog" v-if="showEditModal" style="display: block !important; background-color: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Section</h5>
            <button type="button" class="close" @click="closeEditSectionModal">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateSection">
              <div class="form-group">
                <label for="editSectionName">Section Name</label>
                <input type="text" class="form-control" id="editSectionName" v-model="editSectionData.name" required>
              </div>
              <br>
              <div class="form-group">
                <label for="editSectionDescription">Description</label>
                <textarea class="form-control" id="editSectionDescription" v-model="editSectionData.description"></textarea>
              </div>
              <br>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
<div v-if="showAddBookModal" class="modal" tabindex="-1" role="dialog" style="display: block !important; background-color: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050;">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Add New Book</h5>
        <button type="button" class="close" @click="closeAddBookModal">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="addBook">
          <div class="form-group">
            <label for="bookTitle">Title</label>
            <input type="text" v-model="newBook.title" id="bookTitle" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="bookAuthor">Author</label>
            <input type="text" v-model="newBook.author" id="bookAuthor" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="bookSection">Section</label>
            <select v-model="newBook.section_id" id="bookSection" class="form-control" required>
              <option v-for="section in sections" :value="section.id" :key="section.id">{{ section.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="bookContent">Content</label>
            <textarea v-model="newBook.content" id="bookContent" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="bookPdfPath">PDF Path</label>
            <input type="text" v-model="newBook.pdf_path" id="bookPdfPath" class="form-control">
          </div>
          <button type="submit" class="btn btn-primary">Add Book</button>
        </form>
      </div>
    </div>
  </div>
</div>
<!-- Issued Books Table -->
    <div v-if="currentTable === 'issuedBooks'" class="mb-4">
      <h3>Issued Books</h3>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Book ID</th>
            <th>Issue Date</th>
            <th>Revoke Access</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in issuedBooks" :key="book.id">
            <td>{{ book.id }}</td>
            <td>{{ book.user_id }}</td>
            <td>{{ book.book_id }}</td>
            <td>{{ book.issue_date }}</td>
            <td>
            <button type="button" class="btn btn-danger" @click="revoke_access(book.id)">Revoke Access</button>
          </td>
          </tr>
        </tbody>
      </table>
    </div>
<div v-if="showEditBookModal" class="modal" tabindex="-1" role="dialog" style="display: block !important; background-color: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050;">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Edit Book</h5>
        <button type="button" class="close" @click="closeEditBookModal">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="editBook">
          <div class="form-group">
            <label for="editBookTitle">Title</label>
            <input type="text" v-model="selectedBook.title" id="editBookTitle" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="editBookAuthor">Author</label>
            <input type="text" v-model="selectedBook.author" id="editBookAuthor" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="editBookSection">Section</label>
            <select v-model="selectedBook.section_id" id="editBookSection" class="form-control" required>
              <option v-for="section in sections" :value="section.id" :key="section.id">{{ section.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editBookContent">Content</label>
            <textarea v-model="selectedBook.content" id="editBookContent" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="editBookPdfPath">PDF Path</label>
            <input type="text" v-model="selectedBook.pdf_path" id="editBookPdfPath" class="form-control">
          </div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>
    </div>
  </div>
</div>
  </div>
  `,
  data() {
    return {
      role: localStorage.getItem('role'),
      token: localStorage.getItem('auth_token'),
      sections: [],
      books: [],
      users: [],
      bookRequests: [],
      total_users: 0,
      total_books: 0,
      total_sections: 0,
      pending_requests: 0,
      showModal: false,
      currentGraph: '' ,
      issuedBooks: [],
      newSection: {
        name: '',
        description: ''
        
      },
      showEditModal: false, // New property for showing the edit modal
      editSectionData: {
        id: null,
        name: '',
        description: ''
      },
      showAddBookModal: false,
      showEditBookModal: false,
      newBook: {
        title: '',
        author: '',
        section_id: null,
        content: '',
        pdf_path: '',
      },
      selectedBook: null,
      currentTable: '', // Updated name for clarity
    };
  },
  async mounted() {
    try {
      await this.dashboard_data();
    } catch (err) {
      console.log("Some error occurred");
    }
  },
  methods: {
    async dashboard_data() {
      const response = await fetch(`/lib_dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.token,
        },
      });
      if (response.status == 200) {
        const data = await response.json();
        this.sections = data.sections;
        this.users = data.users;
        this.bookRequests = data.requests;
        this.books = data.books;
        this.total_books = this.books.length;
        this.total_users = this.users.length;
        this.total_sections = this.sections.length;
        this.pending_requests = this.bookRequests.length;
        this.issuedBooks = data.issued_books;
      } else {
        const error = await response.json();
        alert(error.message);
      }
    },    
    showTable(table) {
      this.currentTable = table; 
      if (table === 'sections') {
        this.dashboard_data(); 
      }
    },
    showGraph(graphType) {
      this.currentGraph = graphType;
    },
    getSectionName(sectionId) {
      const section = this.sections.find(sec => sec.id === sectionId);
      return section ? section.name : 'Unknown Section';
    },
    showAddSectionModal() {
      this.showModal = true;

    },
    
    closeAddSectionModal() {
      this.showModal = false;
      this.newSection = { name: '', description: '' };

    },
    showSuccessAlert(message) {
      Swal.fire({
        title: "Success!",
        text: message,
        icon: "success",
        button: "OK",
      });
    },
    
    async addSection() {
      try {
        const response = await fetch('/api/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(this.newSection)
        });
  
        
        if (response.ok) {
          const result = await response.json();
          this.showSuccessAlert(result.message);
          this.closeAddSectionModal();
          await this.dashboard_data(); 
        } else {
          const error = await response.json();
          console.error('Error response:', error);
          alert(error.message || 'An error occurred while adding the section');
        }
      } catch (error) {
        console.error('Error adding section:', error);
        alert('An error occurred while adding the section: ' + error.message);
      }
    },
    async deleteSection(sectionId) {
      const confirmDelete = window.confirm("Are you sure you want to delete this Section?");
      if (confirmDelete) {
        try {
          const response = await fetch(`/api/sections?section_id=${sectionId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
            }
          });

          if (response.ok) {
            const responseData = await response.json();
            this.showSuccessAlert(responseData.message);
            await this.dashboard_data(); 
          } else {
            const error = await response.json();
            alert(error.message || 'An error occurred while deleting the section');
          }
        } catch (error) {
          alert("An error occurred while deleting the Section.");
        }
      }
    },
    async revoke_access(book_id) {
      const confirm_revoke = window.confirm("Are you sure you want to revoke access to this book?");
      if (confirm_revoke) {
          try {
              const response = await fetch(`/revoke_access/${book_id}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': this.token,
                  },
              });
  
              if (response.status === 200) {
                  const response_data = await response.json();
                  this.showSuccessAlert(response_data.message);
                  this.dashboard_data(); // Update application data after successful access revocation
              } else {
                  const error = await response.json();
                  alert(error.message);
              }
          } catch (error) {
              console.error("Error revoking access to book:", error);
              alert("An error occurred while revoking access to the book.");
          }
      }
  },
    showEditSectionModal(section) {
      this.editSectionData = { ...section }; 
      this.showEditModal = true;
    },
    
    closeEditSectionModal() {
      this.showEditModal = false;
      this.editSectionData = { id: null, name: '', description: '' };
    },

    async updateSection() {
      try {
        const response = await fetch(`/api/sections?section_id=${this.editSectionData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify({
            name: this.editSectionData.name,
            description: this.editSectionData.description
          })
        });

        if (response.ok) {
          const result = await response.json();
          this.showSuccessAlert(result.message);
          this.closeEditSectionModal();
          await this.dashboard_data(); // Refresh the data
        } else {
          const error = await response.json();
          alert(error.message || 'An error occurred while updating the section');
        }
      } catch (error) {
        console.error('Error updating section:', error);
        alert('An error occurred while updating the section: ' + error.message);
      }
    },

    async editSection(sectionId) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (section) {
        this.showEditSectionModal(section);
      } else {
        alert('Section not found');
      }
    },
    openAddBookModal() {
      this.showAddBookModal = true;
    },
    closeAddBookModal() {
      this.showAddBookModal = false;
    },
    openEditBookModal(book) {
      this.selectedBook = { ...book };
      this.showEditBookModal = true;
      console.log(this.selectedBook)
    },
    closeEditBookModal() {
      this.showEditBookModal = false;
    },

    async addBook() {
      try {
        const response = await fetch('/api/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(this.newBook),
        });
        if (response.ok) {
          const data = await response.json();
          this.showSuccessAlert(data.message);
          this.books.push(data.book);
          this.closeAddBookModal();
          await this.dashboard_data(); 
          
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (error) {
        console.error('Error adding book:', error);
        alert('An error occurred while adding the book');
      }
    },

    async editBook() {
      try {
        const response = await fetch(`/api/books?book_id=${this.selectedBook.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(this.selectedBook),
        });
        if (response.ok) {
          const data = await response.json();
          this.showSuccessAlert(data.message);
          this.closeEditBookModal();
          await this.dashboard_data(); // Refresh all data
          
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (error) {
        console.error('Error editing book:', error);
        alert('An error occurred while editing the book');
      }
    },

    async deleteBook(bookId) {
      if (confirm("Are you sure you want to delete this book?")) {
        try {
          const response = await fetch(`/api/books?book_id=${bookId}`, {
            method: 'DELETE',
            headers: {
              'Authentication-Token': this.token,
            },
          });
          if (response.ok) {
            this.books = this.books.filter(book => book.id !== bookId);
            await this.dashboard_data(); // Refresh all data
            this.showSuccessAlert('Book deleted successfully');
          } else {
            const error = await response.json();
            alert(error.message);
          }
        } catch (error) {
          console.error('Error deleting book:', error);
          alert('An error occurred while deleting the book');
        }
      }
    },
    async checkOverdueBooks() {
      const confirmCheck = window.confirm("Are you sure you want to check overdue books?");
      if (confirmCheck) {
          try {
              const response = await fetch('/check_overdue_books', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': this.token,  
                  },
              });
  
              if (response.ok) {
                  const responseData = await response.json();
                  this.showSuccessAlert(responseData.message);
                  this.dashboard_data(); 
              } else {
                  const errorData = await response.json();
                  alert(errorData.message);
              }
          } catch (error) {
              console.error("Error checking overdue books:", error);
              alert("An error occurred while checking overdue books.");
          }
      }
  }
  ,
    getBookTitle(bookId) {
      const book = this.books.find(b => b.id === bookId);
      return book ? book.title : 'Unknown Book';
    },
  
    getUserName(userId) {
      const user = this.users.find(u => u.id === userId);
      return user ? user.username : 'Unknown User';
    },
  
    async acceptRequest(requestId) {
      try {
        const response = await fetch(`/book_requests/${requestId}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
        if (response.ok) {
          const data = await response.json();
          this.showSuccessAlert(data.message);
          await this.dashboard_data(); 
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (error) {
        console.error('Error accepting request:', error);
        alert('An error occurred while accepting the request');
      }
    },
  
    async rejectRequest(requestId) {
      try {
        const response = await fetch(`/book_requests/${requestId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
        if (response.ok) {
          const data = await response.json();
          this.showSuccessAlert(data.message);
          await this.dashboard_data(); // Refresh all data
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
        alert('An error occurred while rejecting the request');
      }
    },
  }
};
