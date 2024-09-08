from flask import Flask
from flask_security import Security
from model import db, User
from datastorefile import datastore
import flask_excel as excel
from cache import cache
from flask_login import LoginManager
from tasks import monthly_reminder,daily_reminder
import flask_excel as excel
from celery.schedules import crontab
from worker import celery_init_app

def create_app():
    app = Flask(__name__)

    login_manager = LoginManager(app)
    login_manager.login_view = 'login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.sqlite3'
    app.config['SECRET_KEY'] = 'Deepubhai'
    app.config['SECURITY_PASSWORD_SALT'] = 'Deepu'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['SECURITY_TOKEN_MAX_AGE'] = 3600  # 1 hour token expiration
    app.config['CACHE_TYPE']='RedisCache'
    app.config['CACHE_REDIS_HOST']='localhost'
    app.config['CACHE_REDIS_PORT'] = 6379
    app.config['CACHE_REDIS_DB']=3
    cache.init_app(app)
    db.init_app(app)
    excel.init_excel(app)
    app.security = Security(app, datastore)

    with app.app_context():
        import views  

    return app

app = create_app()
celery_app=celery_init_app(app)

@celery_app.on_after_configure.connect
def celery_job(sender, **kwargs):
    # sender.add_periodic_task(crontab(hour=17, minute=9, day_of_month=21), monthly_reminder.s())
    # sender.add_periodic_task(crontab(hour=17, minute=8), daily_reminder.s())

    sender.add_periodic_task(60,monthly_reminder.s())
    sender.add_periodic_task(40,daily_reminder.s())


if __name__ == '__main__':
    app.run(debug=True)

