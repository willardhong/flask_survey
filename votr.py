from flask import (
  Flask, render_template, request, flash, redirect, url_for, session, jsonify
)
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_script import Manager
from flask_migrate import Migrate

#from models import db, Skills, Options, Results, Users
from models import db, Users, Results
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
import json

#from admin import AdminView, TopicView

votr = Flask(__name__)

login_manager = LoginManager()
login_manager.init_app(votr)

admin = Admin(votr, name='Dashboard')
admin.add_view(ModelView(Users, db.session))

# load config from the config file we created earlier

votr.config.from_object('config')
db.init_app(votr)
db.create_all(app=votr)
#migrate = Migrate(votr, db)

# returns dictionary that can easily be jsonified
def to_json(self):
    return {
            'title': self.title,
            'options':
                [{'name': option.option.name}
                    for option in self.options.all()]
    }

@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))

@votr.route('/')
def home():
    return render_template('index.html')

@votr.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # get the user details from the form
        email = request.form['email']
        password = request.form['password']
        # hash the password
        password = generate_password_hash(password)
        user = Users(email=email, password=password)
        db.session.add(user)
        db.session.commit()
        flash('Thanks for signing up please login')
        return redirect(url_for('home'))
    # it's a GET request, just render the template
    return render_template('signup.html')


@votr.route('/login', methods=['POST'])
def login():
    # we don't need to check the request type as flask will raise a bad request     # error if a request aside from POST is made to this url
    email = request.form['email']
    password = request.form['password']
    # search the database for the User
    user = Users.query.filter_by(email=email).first()

    if user:
        password_hash = user.password
        if check_password_hash(password_hash, password):
            # The hash matches the password in the database log the user in
            login_user(user)
            session['user'] = user.id
            print('The current user id is ' + str(current_user.id) + ' and current email is ' + current_user.email)
            flash('Login was succesfull')
        else:
            # user wasn't found in the database
            flash('Username or password is incorrect please try again', 'error')
    else:
        flash("No user in database")

    firstname = user.email.split('.')[0].capitalize()
    ### build list of skills here ...
    mylist = ['Python','R','Consultation']
    qlist = []

    for x in mylist:
        q = {}
        q['questions'] = [{ "type": "radiogroup", "name": x, "title": x, "choices": ["Master", "Practitioner",
            "Learner"]}]
        qlist.append(q)

    json = {}
    json["title"] = "Skill Survey"
    json["showProgressBar"] = "bottom"
    json["firstPageIsStarted"] = True
    json["startSurveyText"] = "Start Survey"

    json["pages"] = qlist
    json["completedHtml"] = "<h4>Thank You!</h4>"
    #json = json.dump(json)
    print(json)
    print(type(json))

    return render_template('survey.html', user=user, firstname=firstname, json=json)

@votr.route('/logout')
def logout():
    if 'user' in session:
        session.pop('user')
        flash('Thanks for completing the survey!')
    return redirect(url_for('home'))


@votr.route('/survey')
@login_required
def survey():
    return render_template('survey.html', json=json)

@votr.route('/api/polls', methods=['GET', 'POST'])
# retrieves/adds polls from/to the database
def api_polls():
    if request.method == 'POST':
        # get the poll and save it in the database
        result = json.loads(request.data)
        print(result)
        print('session user id is: ' + str(session['user']))
        for key, value in result.items():
            r = Results(user_id=session['user'], skill=key, option=value)
            print(r.skill)
            db.session.add(r)
            db.session.commit()
            if not value:
                return jsonify({'error': 'value for {} is empty'.format(key)})

        if 'user' in session:
            session.pop('user')
            logout_user()
            flash('Thanks for completing the survey!')
        return jsonify({'message': 'Survey was completed succesfully'})
    else:
        # query the db and return all the polls as json
        # polls = Topics.query.join(Polls).all()
        all_polls =[{'title': 'Which side is going to win the EPL this season', 'options': [{'name': 'Arsenal', 'vote_count': None}, {'name': 'Spurs', 'vote_count': None}]}, {'title': 'Whos better liverpool or city', 'options': [{'name': 'Liverpool FC', 'vote_count': None}, {'name': 'Manchester city', 'vote_count': None}]}]
        resp = jsonify(all_polls)
        print(resp)
        return resp

if __name__ == '__main__':
    votr.run()
