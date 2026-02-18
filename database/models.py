from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Settings(db.Model):
    key = db.Column(db.String(50), primary_key=True)
    value = db.Column(db.String(200))
    type = db.Column(db.String(20), default='string') # string, bool, int

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(50), unique=True)
    type = db.Column(db.String(50)) # email, whatsapp
    status = db.Column(db.String(20)) # pending, completed, failed
    details = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    error = db.Column(db.Text)

def init_db(app):
    with app.app_context():
        db.create_all()
        # Seed default settings if not exist
        if not Settings.query.filter_by(key='WHATSAPP_ALERTS_ENABLED').first():
            db.session.add(Settings(key='WHATSAPP_ALERTS_ENABLED', value='true', type='bool'))
            db.session.add(Settings(key='WHATSAPP_ALERT_PHONE', value='+919699295191', type='string'))
            db.session.add(Settings(key='WHATSAPP_ALERT_ON_IMPORTANT', value='true', type='bool'))
            db.session.add(Settings(key='WHATSAPP_ALERT_ON_CRITICAL', value='true', type='bool'))
            
            # Create default admin user if no users
            if not User.query.first():
                admin = User(username='admin')
                admin.set_password('admin123') # Change this!
                db.session.add(admin)
                
            db.session.commit()
