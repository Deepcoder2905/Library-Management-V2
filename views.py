from flask import current_app as app, jsonify, render_template, request
from flask_restful import Resource, Api, reqparse, marshal, fields, marshal_with
from flask_security import auth_required, roles_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from model import db, User, Book, Section, BookRequest, RatingFeedback
from datastorefile import datastore
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
from datetime import datetime, timedelta
from cache import cache
from flask_jwt_extended import decode_token

api = Api(app, prefix='/api')  # Ensure this is initialized after `app` is available

@app.get('/')
def home():
    return render_template('index.html')

@app.post('/admin_login')
def admin_login():
    input_data = request.get_json()
    input_username = input_data.get('username')
    input_password = input_data.get('password')

    if not input_username or not input_password:
        return jsonify({'message': 'Username and Password are required.'}), 400
    
    user = datastore.find_user(username=input_username)

    if not user or not check_password_hash(user.password, input_password):
        return jsonify({'message': 'Invalid username or password.'}), 401

    user.last_activity = datetime.now()
    db.session.commit()
    

    auth_token = user.get_auth_token()
    roles = [role.name for role in user.roles]
    books=Book.query.all()
    sections=Section.query.all()
    rating_graph(books)
    section_book_count_graph(sections,books)

    return jsonify({'auth_token': auth_token, 'role': roles}), 200

@app.get('/lib_dashboard')
@auth_required('token')
@roles_required('admin')
def admin_dashboard_data():

    users = User.query.all()
    all_users = [{'id': user.id, 'username': user.username, 'email': user.email, 'active': user.active, 'roles': [role.name for role in user.roles]} for user in users]

    books = Book.query.all()
    all_books = [{'id': book.id, 'title': book.title, 'author': book.author, 'section_id': book.section_id, 'date_created': book.date_created, 'pdf_path': book.pdf_path} for book in books]

    sections = Section.query.all()
    all_sections = [{'id': section.id, 'name': section.name, 'date_created': section.date_created, 'description': section.description} for section in sections]

    book_requests = BookRequest.query.all()
    all_requests = [{'id': request.id, 'user_id': request.user_id, 'book_id': request.book_id, 'created_at': request.created_at, 'updated_at': request.updated_at, 'status': request.status} for request in book_requests]

    # Issued Books
    issued_books = [request for request in book_requests if request.status == 'accepted']
    all_issued_books = [{'id': request.id, 'user_id': request.user_id, 'book_id': request.book_id, 'issue_date': request.updated_at} for request in issued_books]

    return jsonify({
        'users': all_users,
        'books': all_books,
        'sections': all_sections,
        'requests': all_requests,
        'issued_books': all_issued_books,
    }), 200

@app.route('/revoke_access/<int:request_id>', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def delete_book_request(request_id):
    book_request = BookRequest.query.get(request_id)
    if not book_request:
        return jsonify({'message': 'Book request not found'}), 404
    
    db.session.delete(book_request)
    db.session.commit()
    return jsonify({'message': 'Book request deleted successfully'}), 200

@app.post('/user_register')
def user_register():
    input_data = request.get_json()
    input_email = input_data.get('email')
    input_username = input_data.get('username')
    input_password = input_data.get('password')

    if not input_email or not input_username or not input_password:
        return jsonify({'message': 'Email, Username, and Password are required.'}), 400
    
    if datastore.find_user(username=input_username):
        return jsonify({'message': 'Username already taken.'}), 409

    if not datastore.find_user(email=input_email):
        datastore.create_user(
            email=input_email, 
            username=input_username, 
            password=generate_password_hash(input_password), 
            roles=['user']
        )
        db.session.commit()
        return jsonify({'message': 'User registered successfully. You can login now.'}), 200
    else:
        return jsonify({'message': 'Email already registered.'}), 409

@app.post('/user_login')
def user_login():
    input_data = request.get_json()
    input_username = input_data.get('username')
    input_password = input_data.get('password')

    if not input_username or not input_password:
        return jsonify({'message': 'Username and Password are required.'}), 400
    
    user = datastore.find_user(username=input_username)

    if not user:
        return jsonify({'message': 'User not found. Register first.'}), 404

    if not check_password_hash(user.password, input_password):
        return jsonify({'message': 'Incorrect Password'}), 401
    
    if not user.active:
        return jsonify({'message': 'Your account has been blacklisted.'}), 403
    
    user.last_activity = datetime.now()
    db.session.commit()
    return jsonify({'auth_token': user.get_auth_token(), 'role': [role.name for role in user.roles]}), 200

# ====================== API RESOURCES ====================== #

# Section management
section_parser = reqparse.RequestParser()
section_parser.add_argument('name', type=str, required=True, help='Name is required and should be a string.')
section_parser.add_argument('description', type=str)

section_fields = {
    'id': fields.Integer(attribute='_id'),
    'name': fields.String,
    'date_created': fields.DateTime,
    'description': fields.String,
}

class ManageSection(Resource):
    @marshal_with(section_fields)
    @auth_required('token')
    def get(self):
        all_sections = Section.query.all()
        return all_sections

    @auth_required('token')
    def post(self):
        args = section_parser.parse_args()
        new_section = Section(name=args['name'], description=args['description'])
        db.session.add(new_section)
        db.session.commit()
        return {'message': 'Section added Successfully', 'section': marshal(new_section, section_fields)}

    @auth_required('token')
    def put(self):
        args = section_parser.parse_args()
        section_id = request.args.get('section_id')
        section = Section.query.get_or_404(section_id)
        if args['name']:
            section.name = args['name']
        if args['description']:
            section.description = args['description']
        db.session.commit()
        return {'message': 'Section updated Successfully'}

    @auth_required('token')
    def delete(self):
        section_id = request.args.get('section_id')
        section = Section.query.get_or_404(section_id)
        db.session.delete(section)
        db.session.commit()
        return {'message': 'Section deleted Successfully'}

api.add_resource(ManageSection, '/sections')

# Book management
book_parser = reqparse.RequestParser()
book_parser.add_argument('title', type=str, required=True, help='Title is required and should be a string.')
book_parser.add_argument('author', type=str, required=True, help='Author is required and should be a string.')
book_parser.add_argument('section_id', type=int, required=True, help='Section ID is required and should be a number.')
book_parser.add_argument('content', type=str)
book_parser.add_argument('pdf_path', type=str)

book_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'author': fields.String,
    'section_id': fields.Integer,
    'content': fields.String,
    'pdf_path': fields.String,
    'date_created': fields.DateTime
}


class ManageBook(Resource):
    @marshal_with(book_fields)
    @auth_required('token')
    def get(self):
        section_id = request.args.get('section_id')
        if section_id:
            books = Book.query.filter_by(section_id=section_id).all()
        else:
            books = Book.query.all()
        
        # Serialize books to JSON
        books_list = [book.to_dict() for book in books]  # Assuming `to_dict` method exists on your `Book` model
        return jsonify(books_list)

    @auth_required('token')
    def post(self):
        args = book_parser.parse_args()
        new_book = Book(**args)
        db.session.add(new_book)
        db.session.commit()
        return {'message': 'Book added Successfully', 'book': marshal(new_book, book_fields)}

    @auth_required('token')
    def put(self):
        args = book_parser.parse_args()
        book_id = request.args.get('book_id')
        book = Book.query.get_or_404(book_id)
        if args['title']:
            book.title = args['title']
        if args['author']:
            book.author = args['author']
        if args['section_id']:
            book.section_id = args['section_id']
        if args['content']:
            book.content = args['content']
        if args['pdf_path']:
            book.pdf_path = args['pdf_path']
        db.session.commit()
        return {'message': 'Book updated Successfully'}

    @auth_required('token')
    def delete(self):
        book_id = request.args.get('book_id')
        book = Book.query.get_or_404(book_id)
        db.session.delete(book)
        db.session.commit()
        return {'message': 'Book deleted Successfully'}

# Ensure the endpoint is correctly registered
api.add_resource(ManageBook, '/books')

@app.route('/book_requests/<int:request_id>/accept', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def accept_book_request(request_id):
    book_request = BookRequest.query.get_or_404(request_id)
    if book_request.status != 'pending':
        return jsonify({'message': 'This request is not pending.'}), 400
    
    book_request.status = 'accepted'
    book_request.updated_at=datetime.now()
    db.session.commit()
    return jsonify({'message': 'Book request approved successfully.'}), 200

@app.route('/book_requests/<int:request_id>/reject', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def reject_book_request(request_id):
    book_request = BookRequest.query.get_or_404(request_id)
    if book_request.status != 'pending':
        return jsonify({'message': 'This request is not pending.'}), 400
    
    db.session.delete(book_request)
    db.session.commit()
    return jsonify({'message': 'Book request rejected and deleted successfully.'}), 200

@app.route('/user_name', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_user_name():
    return jsonify({'username': current_user.username}), 200

@app.route('/user_books', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_user_books():
    user_books = Book.query.join(BookRequest).filter(
        BookRequest.user_id == current_user.id,
        BookRequest.status == 'accepted'
    ).all()
    books = [{'id': book.id, 'title': book.title, 'author': book.author} for book in user_books]
    return jsonify({'books': books}), 200

@app.route('/requested_books', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_requested_books():
    requested_books = BookRequest.query.filter_by(user_id=current_user.id).all()
    books = [{
        'id': book.id,
        'title': book.book.title,
        'author': book.book.author,
        'status': book.status
    } for book in requested_books]
    return jsonify({'books': books}), 200
@app.route('/available_books', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_available_books():
    books = Book.query.join(Section).add_columns(
        Book.id, Book.title, Book.author, Book.section_id, Section.name.label('section_name')
    ).all()
    
    books_data = [{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'section_id': book.section_id,
        'section_name': book.section_name
    } for book in books]
    
    return jsonify({'available_books_info': books_data})

@app.route('/request_book/<int:book_id>', methods=['POST'])
@auth_required('token')
@roles_required('user')
def request_book(book_id):

    book = Book.query.get(book_id)
    if not book:
        return jsonify({'message': 'Book not available'}), 400


    existing_request = BookRequest.query.filter_by(user_id=current_user.id, book_id=book_id).first()
    if existing_request:
        return jsonify({'message': 'Book already requested'}), 400

    num_requested_books = BookRequest.query.filter_by(user_id=current_user.id).count()
    if num_requested_books >= 5:
        return jsonify({'message': 'Maximum of 5 e-books can be requested at a time'}), 400
    book_request = BookRequest(user_id=current_user.id, book_id=book_id)
    db.session.add(book_request)
    db.session.commit()

    return jsonify({'message': 'Book requested successfully'}), 200

@app.route('/return_book/<int:book_id>', methods=['POST'])
@auth_required('token')
@roles_required('user')
def return_book(book_id):
    book_request = BookRequest.query.filter_by(book_id=book_id, user_id=current_user.id).first()
    if not book_request or book_request.status != 'accepted':
        return jsonify({'message': 'Invalid request'}), 400

    book_request.status = 'Returned'
    db.session.delete(book_request)
    db.session.commit()

    return jsonify({'message': 'Book returned successfully'}), 200

@app.route('/cancel_request/<int:book_id>', methods=['POST'])
@auth_required('token')
@roles_required('user')
def cancel_request(book_id):
    book_request = BookRequest.query.filter_by(book_id=book_id, user_id=current_user.id).first()
    db.session.delete(book_request)
    db.session.commit()

    return jsonify({'message': 'Book returned successfully'}), 200

@app.post('/check_overdue_books')
@auth_required('token')
@roles_required('admin')
def check_overdue_books():
    # Calculate the date 7 days ago
    seven_days_ago = datetime.now() - timedelta(days=7)
    
    overdue_books = BookRequest.query.filter_by(status='accepted').filter(BookRequest.updated_at < seven_days_ago).all()
    
    for book_request in overdue_books:
        # Revoke access to the book
        book_request.status = 'revoked'
        book_request.updated_at = datetime.now()
    
    db.session.commit()
    
    response = {'message': f'Checked {len(overdue_books)} overdue books and revoked access successfully!'}
    return jsonify(response)
@app.route('/rate_and_feedback', methods=['POST'])
@auth_required('token')
@roles_required('user')
def rate_and_feedback():
    data = request.json
    book_id = data.get('book_id')
    rating = data.get('rating')
    feedback = data.get('feedback')

    if not all([book_id, rating, feedback]):
        return jsonify({'message': 'Missing required fields'}), 400

    existing_rating = RatingFeedback.query.filter_by(book_id=book_id, user_id=current_user.id).first()

    if existing_rating:
        existing_rating.rating = rating
        existing_rating.feedback = feedback
    else:
        new_rating = RatingFeedback(book_id=book_id, user_id=current_user.id, rating=rating, feedback=feedback)
        db.session.add(new_rating)

    db.session.commit()
    return jsonify({'message': 'Rating and feedback submitted successfully'}), 200

@app.route('/book_content/<int:book_id>', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_book_content(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify({'content': book.content}), 200

@app.route('/book_rating_feedback/<int:book_id>', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_book_rating_feedback(book_id):
    rating_feedback = RatingFeedback.query.filter_by(book_id=book_id, user_id=current_user.id).first()
    if rating_feedback:
        return jsonify({
            'rating': rating_feedback.rating,
            'feedback': rating_feedback.feedback
        }), 200
    return jsonify({'message': 'No rating and feedback found'}), 404

import matplotlib.pyplot as plt
import seaborn as sns
from sqlalchemy.orm import joinedload

# Set the style for all graphs
sns.set(style="whitegrid")

def rating_graph(books):
    book_names = [book.title for book in books]
    ratings = []
    
    for book in books:
        avg_rating = sum([rating.rating for rating in book.ratings_feedback]) / len(book.ratings_feedback) if book.ratings_feedback else 0
        ratings.append(avg_rating)
    
    plt.figure(figsize=(10, 7))  # Adjust figure size for a better view
    sns.barplot(x=ratings, y=book_names, palette='coolwarm')
    plt.xlabel('Average Rating (%)', fontweight='bold', fontsize=12)
    plt.ylabel('Book Titles', fontweight='bold', fontsize=12)
    plt.title('Average Rating of Books', fontweight='bold', fontsize=14)
    plt.tight_layout()
    # Save the graph as an image file in the static folder
    plt.savefig('static/images/rating_graph.png')

def section_book_count_graph(sections, books):
    # Create a dictionary to count books per section
    section_book_count = {section.id: 0 for section in sections}

    # Count the number of books in each section
    for book in books:
        if book.section_id in section_book_count:
            section_book_count[book.section_id] += 1

    # Prepare data for plotting
    section_names = [section.name for section in sections]
    book_counts = [section_book_count.get(section.id, 0) for section in sections]

    # Create the bar plot
    plt.figure(figsize=(12, 7))  # Adjust figure size as needed
    sns.barplot(x=section_names, y=book_counts, palette='viridis')
    plt.xlabel('Sections', fontweight='bold', fontsize=12)
    plt.ylabel('Number of Books', fontweight='bold', fontsize=12)
    plt.title('Number of Books in Each Section', fontweight='bold', fontsize=14)
    plt.xticks(rotation=45, ha='right', fontsize=10)  # Rotate x-axis labels for better readability
    plt.tight_layout()

    # Save the graph as an image file in the static folder
    plt.savefig('static/images/section_book_count_graph.png')
    plt.close()  # Close the plot to free up memory
