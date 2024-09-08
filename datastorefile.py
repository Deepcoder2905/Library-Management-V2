from flask_security import SQLAlchemyUserDatastore
from model import db, User, Role

datastore = SQLAlchemyUserDatastore(db, User, Role)