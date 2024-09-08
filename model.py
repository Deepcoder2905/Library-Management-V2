from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime

db = SQLAlchemy()

# User Model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String)
    last_activity = db.Column(db.DateTime, default=datetime.now)
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('users', lazy='dynamic'))

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    description = db.Column(db.String)
class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer, db.ForeignKey('role.id'))

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'))
    content = db.Column(db.String(100), nullable=False)
    pdf_path = db.Column(db.String(400), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.now)
    
    # Relationship to the User model

class Section(db.Model):
	id = db.Column("id", db.Integer, primary_key=True)
	name = db.Column(db.String(100), unique=True, nullable=False)
	date_created = db.Column(db.DateTime, default=datetime.utcnow)
	description = db.Column(db.Text, nullable=True)
    
section = db.relationship('Section', backref=db.backref('books'))

class BookRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now)
    status = db.Column(db.String(20), default='pending', nullable=False)

    user = db.relationship('User', backref=db.backref('requests', lazy=True))
    book = db.relationship('Book', backref=db.backref('requests', lazy=True))

class RatingFeedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    feedback = db.Column(db.Text, nullable=False)

    book = db.relationship('Book', backref=db.backref('ratings_feedback', lazy=True))
    user = db.relationship('User', backref=db.backref('ratings_feedback', lazy=True))
