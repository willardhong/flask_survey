from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

# create a new SQLAlchemy object
db = SQLAlchemy()
#login_manager = LoginManager()
#login_manager.init_app(app)

# Base model that for other models to inherit from
class Base(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    date_modified = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

# Model for skills
'''
class Skills(Base):
    skill = db.Column(db.String(500))
    status = db.Column(db.Boolean, default=True)  # to mark poll as open or closed

    # user friendly way to display the object
    def __repr__(self):
        return self.skill

# Model for poll options
class Options(Base):
    name = db.Column(db.String(200))
    #skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'))
    #skill = db.relationship('Skills', foreign_keys=[skill_id], backref=db.backref('options', lazy='dynamic'))
'''
# Model to store user details
class Users(UserMixin, Base):
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(200))
    results = db.relationship('Results', backref='author', lazy='dynamic')

    def __repr__(self):
        return self.email

class Results(Base):
    # Columns declaration
    '''
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'))
    option_id = db.Column(db.Integer, db.ForeignKey('options.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    '''
    # Relationship declaration (makes it easier for us to access the polls model
    # from the other models it's related to)
    skill = db.Column(db.String(200))
    option = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    def __repr__(self):
    # a user friendly way to view our objects in the terminal
        return self.skill
