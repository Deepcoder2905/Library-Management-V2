from app import app
from model import db, Section, Book, BookRequest,RatingFeedback
from werkzeug.security import generate_password_hash
from datastorefile import datastore
from datetime import datetime

def initialize_sample_data():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create roles
        datastore.find_or_create_role(name='admin', description='This is the admin role')
        datastore.find_or_create_role(name='user', description='This is the user role')
        db.session.commit()
        
        # Create users
        if not datastore.find_user(username='A1'):
            datastore.create_user(
                email='A1@email.com', 
                username='A1', 
                password=generate_password_hash('a1'), 
                roles=['admin']
            )
        if not datastore.find_user(username='User1'):
            datastore.create_user(
                email='abc@email.com', 
                username='User1', 
                password=generate_password_hash('12'), 
                roles=['user']
            )
        db.session.commit()
        
        # Create sections
        section1 = Section(name='Fiction', description='Fiction books section')
        section2 = Section(name='Science', description='Science books section')
        db.session.add_all([section1, section2])
        db.session.commit()
        
        # Create books
        book1 = Book(
            title='The Great Gatsby', 
            author='F. Scott Fitzgerald', 
            section_id=section1.id, 
            content='A novel about the American dream.', 
            pdf_path='/path/to/gatsby.pdf', 
        )
        book2 = Book(
            title='A Brief History of Time', 
            author='Stephen Hawking', 
            section_id=section2.id, 
            content='A book on cosmology and theoretical physics.', 
            pdf_path='/path/to/brief_history.pdf', 
        )
        db.session.add_all([book1, book2])
        db.session.commit()
        
        # Create book requests
        request1 = BookRequest(
            user_id=datastore.find_user(username='User1').id,
            book_id=book1.id,
            status='pending'
        )
        db.session.add(request1)
        db.session.commit()
        
        # Create rating feedback
        feedback1 = RatingFeedback(
            book_id=book1.id,
            user_id=datastore.find_user(username='User1').id,
            rating=5,
            feedback='An amazing book!'
        )
        db.session.add(feedback1)
        db.session.commit()
if __name__ == '__main__':
    initialize_sample_data()
