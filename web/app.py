import os
import sys
import logging
from datetime import datetime
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
os.makedirs(logs_dir, exist_ok=True)

# Configure logging
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(logs_dir, 'app.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/static'
)

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['ENV'] = os.getenv('FLASK_ENV', 'development')
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', '1') == '1'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///mscheduler.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-dev-secret') # Change this!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600 * 24 # 24 hours

# Enable CORS for API requests - RESTRICT TO FRONTEND PORT
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Initialize Extensions
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from database.models import db, init_db, User, Settings, Job

db.init_app(app)
jwt = JWTManager(app)

# Initialize DB
init_db(app)

# Helper to get setting
def get_setting(key, default=None):
    setting = Settings.query.get(key)
    if setting:
        if setting.type == 'bool':
            return setting.value.lower() == 'true'
        if setting.type == 'int':
            return int(setting.value)
        return setting.value
    return default

# ============= ROUTES =============

# Login Endpoint
@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
        
    return jsonify({"msg": "Bad username or password"}), 401

# System Status
@app.route('/api/status', methods=['GET'])
# @jwt_required() # Optional: keep public for health checks?
def api_status():
    return jsonify({
        'status': 'ok',
        'message': 'Server is running',
        'timestamp': datetime.now().isoformat(),
        'environment': app.config['ENV']
    })

# Dashboard Stats
@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def api_dashboard():
    logger.info('Dashboard API called')
    
    # Calculate stats from DB
    active_jobs = Job.query.filter_by(status='pending').count()
    completed_jobs = Job.query.filter_by(status='completed').count()
    failed_jobs = Job.query.filter_by(status='failed').count()
    
    return jsonify({
        'stats': {
            'active_jobs': active_jobs,
            'completed_jobs': completed_jobs,
            'failed_jobs': failed_jobs,
            'system_status': 'online'
        },
        'timestamp': datetime.now().isoformat()
    })

# Get all jobs
@app.route('/api/jobs', methods=['GET'])
def api_jobs():
    logger.info('Jobs API called')
    return jsonify({
        'jobs': [],
        'total': 0,
        'timestamp': datetime.now().isoformat()
    })

# Get job by ID
@app.route('/api/jobs/<job_id>', methods=['GET'])
def api_job_detail(job_id):
    logger.info(f'Job detail requested: {job_id}')
    return jsonify({
        'error': 'Job not found',
        'job_id': job_id
    }), 404

# Create new job
@app.route('/api/jobs', methods=['POST'])
def api_create_job():
    data = request.get_json()
    logger.info(f'Job creation requested: {data}')
    return jsonify({
        'message': 'Job created successfully',
        'job_id': 'job_001'
    }), 201

# Get logs
@app.route('/api/logs', methods=['GET'])
def api_logs():
    try:
        limit = request.args.get('limit', default=50, type=int)
        logger.info(f'Logs API called (limit: {limit})')
        
        logs = []
        log_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs', 'bot.log')
        
        if os.path.exists(log_file_path):
            with open(log_file_path, 'r') as f:
                lines = f.readlines()
                # Get last N lines
                recent_lines = lines[-limit:] if len(lines) > limit else lines
                
                for line in reversed(recent_lines):
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Parse log line format: "TRIAGE | sender | subject | category | action"
                    # or "Email sent to email@example.com"
                    # or "FAILED email to email@example.com : error"
                    log_entry = {
                        'timestamp': datetime.now().isoformat(),  # You might want to parse actual timestamp
                        'message': line,
                        'type': 'email',
                        'status': 'success' if 'FAILED' not in line else 'error',
                    }
                    
                    if '|' in line:
                        parts = [p.strip() for p in line.split('|')]
                        if len(parts) >= 5:
                            log_entry.update({
                                'type': 'email',
                                'action': parts[4] if len(parts) > 4 else 'unknown',
                                'recipient': parts[1] if len(parts) > 1 else 'N/A',
                                'subject': parts[2] if len(parts) > 2 else 'N/A',
                                'category': parts[3] if len(parts) > 3 else 'N/A',
                            })
                    elif 'Email sent to' in line:
                        log_entry.update({
                            'action': 'sent',
                            'recipient': line.split('Email sent to')[1].strip() if 'Email sent to' in line else 'N/A',
                        })
                    elif 'FAILED' in line:
                        log_entry.update({
                            'action': 'failed',
                            'status': 'error',
                        })
                    
                    logs.append(log_entry)
        
        return jsonify({
            'logs': logs,
            'total': len(logs),
            'limit': limit,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f'Error fetching logs: {str(e)}')
        return jsonify({
            'logs': [],
            'total': 0,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({
        'healthy': True,
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

# ============= EMAIL ENDPOINTS =============

# Send Email
@app.route('/api/email/send', methods=['POST'])
def api_send_email():
    try:
        data = request.get_json()
        to_email = data.get('to')
        subject = data.get('subject')
        body = data.get('body')
        cc = data.get('cc', '')
        bcc = data.get('bcc', '')
        
        if not to_email or not subject or not body:
            return jsonify({
                'error': 'Missing required fields: to, subject, body'
            }), 400
        
        from email_bot.sender import send_email
        
        # Handle CC and BCC if provided
        if cc or bcc:
            # For now, send_email only handles single recipient
            # You might want to enhance sender.py to support CC/BCC
            pass
        
        success = send_email(to_email, subject, body)
        
        if success:
            # Update stats
            app_state['completed_jobs'] += 1
            
            return jsonify({
                'success': True,
                'message': 'Email sent successfully',
                'to': to_email,
                'subject': subject
            }), 200
        else:
            app_state['failed_jobs'] += 1
            return jsonify({
                'success': False,
                'error': 'Failed to send email'
            }), 500
            
    except Exception as e:
        logger.error(f'Error sending email: {str(e)}')
        app_state['failed_jobs'] += 1
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Get Inbox Emails
@app.route('/api/email/inbox', methods=['GET'])
def api_get_inbox():
    try:
        limit = request.args.get('limit', default=50, type=int)
        unread_only = request.args.get('unread_only', default='false').lower() == 'true'
        
        logger.info(f'Fetching inbox: limit={limit}, unread_only={unread_only}')
        
        from email_bot.reader import fetch_emails
        
        try:
            emails = fetch_emails(limit=limit, unread_only=unread_only)
        except Exception as imap_error:
            logger.error(f'IMAP error: {str(imap_error)}')
            # Return empty list with error message instead of crashing
            return jsonify({
                'emails': [],
                'total': 0,
                'limit': limit,
                'error': f'Failed to connect to email server: {str(imap_error)}',
                'message': 'Please check your email credentials and IMAP settings'
            }), 200  # Return 200 with error message so frontend can display it
        
        logger.info(f'Fetched {len(emails)} emails from inbox')
        
        # Format emails for frontend
        formatted_emails = []
        for email in emails:
            try:
                # Classify email using AI
                category = 'UNCERTAIN'
                risk_level = 0.5
                try:
                    from ai.gemini_engine import analyze_email
                    analysis = analyze_email(
                        subject=email.get('subject', ''),
                        sender=email.get('from', ''),
                        body=email.get('body', '')[:500]  # Limit body for analysis
                    )
                    category = analysis.get('category', 'UNCERTAIN')
                    risk_level = analysis.get('risk_level', 0.5)
                except Exception as ai_error:
                    logger.warning(f'Failed to analyze email: {str(ai_error)}')
                    # Use keyword-based classification as fallback
                    from email_bot.autoreplay import classify_email
                    content = (email.get('subject', '') + ' ' + email.get('body', '')).lower()
                    category = classify_email(content)
                
                # Extract email address from sender string
                sender_email = email.get('from', '') or 'Unknown'
                if '<' in sender_email:
                    sender_email = sender_email.split('<')[1].replace('>', '').strip()
                
                # Use actual date if available, otherwise use current time
                email_date = email.get('date')
                if email_date:
                    try:
                        # Parse the date string if it's in RFC format
                        from email.utils import parsedate_to_datetime
                        if isinstance(email_date, str):
                            email_date = parsedate_to_datetime(email_date).isoformat()
                    except:
                        email_date = datetime.now().isoformat()
                else:
                    email_date = datetime.now().isoformat()
                
                # Trigger WhatsApp alert for important/critical emails
                try:
                    if category in ['CRITICAL', 'OFFICIAL']:
                        from whatsapp_bot.alert_service import send_email_alert
                        
                        # Map category to alert type
                        alert_classification = 'critical' if category == 'CRITICAL' else 'important'
                        
                        # Send alert asynchronously to avoid blocking email fetching
                        # In production, use Celery or similar for async tasks
                        alert_result = send_email_alert(
                            classification=alert_classification,
                            subject=email.get('subject', 'No Subject'),
                            sender=email.get('from', 'Unknown')
                        )
                        
                        if alert_result:
                            logger.info(f'WhatsApp alert sent for {alert_classification} email from {sender_email}')
                        else:
                            logger.warning(f'Failed to send WhatsApp alert for {alert_classification} email')
                except Exception as alert_error:
                    logger.error(f'Error sending WhatsApp alert: {str(alert_error)}')
                    # Continue processing even if alert fails
                
                formatted_emails.append({
                    'id': str(email.get('id', '')),
                    'from': sender_email,
                    'subject': email.get('subject') or 'No Subject',
                    'preview': (email.get('body', '') or '')[:200],
                    'body': email.get('body', '') or '',
                    'date': email_date,
                    'unread': unread_only,  # If we fetched unread_only, mark as unread
                    'important': category in ['CRITICAL', 'OFFICIAL'],
                    'category': category,
                    'risk_level': risk_level
                })
            except Exception as format_error:
                logger.warning(f'Error formatting email {email.get("id")}: {str(format_error)}')
                continue
        
        return jsonify({
            'emails': formatted_emails,
            'total': len(formatted_emails),
            'limit': limit
        }), 200
        
    except Exception as e:
        logger.error(f'Error fetching inbox: {str(e)}', exc_info=True)
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f'Traceback: {error_trace}')
        return jsonify({
            'error': str(e),
            'emails': [],
            'total': 0,
            'message': 'An unexpected error occurred while fetching emails'
        }), 500

# Analyze Email
@app.route('/api/email/analyze', methods=['POST'])
def api_analyze_email():
    try:
        data = request.get_json()
        subject = data.get('subject', '')
        sender = data.get('sender', '')
        body = data.get('body', '')
        
        if not subject and not body:
            return jsonify({
                'error': 'At least subject or body is required'
            }), 400
        
        from ai.gemini_engine import analyze_email
        analysis = analyze_email(subject=subject, sender=sender, body=body)
        
        return jsonify({
            'analysis': analysis
        }), 200
        
    except Exception as e:
        logger.error(f'Error analyzing email: {str(e)}')
        return jsonify({
            'error': str(e)
        }), 500

# ============= WHATSAPP ENDPOINTS =============

# WhatsApp bot instance (lazy loaded)
whatsapp_bot = None
whatsapp_status = {'connected': False, 'error': None}

@app.route('/api/whatsapp/status', methods=['GET'])
def api_whatsapp_status():
    """Get WhatsApp connection status."""
    global whatsapp_bot, whatsapp_status
    return jsonify({
        'connected': whatsapp_bot is not None and whatsapp_status['connected'],
        'error': whatsapp_status.get('error')
    }), 200

@app.route('/api/whatsapp/connect', methods=['POST'])
def api_whatsapp_connect():
    """Initialize WhatsApp bot connection."""
    global whatsapp_bot, whatsapp_status
    
    try:
        if whatsapp_bot is not None:
            return jsonify({
                'success': True,
                'message': 'WhatsApp already connected'
            }), 200
        
        # Import with better error handling
        try:
            from whatsapp_bot.sender import WhatsAppBot
        except ImportError as ie:
            error_msg = f'Failed to import WhatsAppBot: {str(ie)}. Make sure webdriver-manager is installed: pip install webdriver-manager'
            logger.error(error_msg)
            whatsapp_status = {'connected': False, 'error': error_msg}
            return jsonify({
                'success': False,
                'error': error_msg
            }), 500
        
        whatsapp_bot = WhatsAppBot()
        whatsapp_status = {'connected': True, 'error': None}
        
        return jsonify({
            'success': True,
            'message': 'WhatsApp connected successfully'
        }), 200
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f'Error connecting WhatsApp: {error_msg}')
        import traceback
        logger.error(traceback.format_exc())
        whatsapp_status = {'connected': False, 'error': error_msg}
        return jsonify({
            'success': False,
            'error': error_msg
        }), 500

@app.route('/api/whatsapp/disconnect', methods=['POST'])
def api_whatsapp_disconnect():
    """Disconnect WhatsApp bot."""
    global whatsapp_bot, whatsapp_status
    
    try:
        if whatsapp_bot:
            whatsapp_bot.close()
            whatsapp_bot = None
        whatsapp_status = {'connected': False, 'error': None}
        
        return jsonify({
            'success': True,
            'message': 'WhatsApp disconnected'
        }), 200
        
    except Exception as e:
        logger.error(f'Error disconnecting WhatsApp: {str(e)}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/whatsapp/send', methods=['POST'])
def api_whatsapp_send():
    """Send a WhatsApp message."""
    global whatsapp_bot, whatsapp_status
    
    try:
        if not whatsapp_bot or not whatsapp_status['connected']:
            return jsonify({
                'success': False,
                'error': 'WhatsApp not connected. Please connect first.'
            }), 400
        
        data = request.get_json()
        contact = data.get('contact')
        message = data.get('message')
        
        if not contact or not message:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: contact, message'
            }), 400
        
        success = whatsapp_bot.send_message(contact, message)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Message sent to {contact}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to send message'
            }), 500
            
    except Exception as e:
        logger.error(f'Error sending WhatsApp message: {str(e)}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/whatsapp/contacts', methods=['GET'])
def api_whatsapp_contacts():
    """Get WhatsApp contacts."""
    global whatsapp_bot, whatsapp_status
    
    try:
        if not whatsapp_bot or not whatsapp_status['connected']:
            return jsonify({
                'contacts': [],
                'error': 'WhatsApp not connected'
            }), 200
        
        contacts = whatsapp_bot.get_contacts()
        return jsonify({
            'contacts': contacts
        }), 200
        
    except Exception as e:
        logger.error(f'Error getting contacts: {str(e)}')
        return jsonify({
            'contacts': [],
            'error': str(e)
        }), 500

# ============= WHATSAPP ALERT ENDPOINTS =============

@app.route('/api/whatsapp/alerts/status', methods=['GET'])
@jwt_required()
def api_whatsapp_alerts_status():
    """Get WhatsApp alert configuration status."""
    try:
        from whatsapp_bot.alert_service import WhatsAppAlertService
        
        # Read from DB instead of config.py
        phone_number = get_setting('WHATSAPP_ALERT_PHONE', '')
        enabled = get_setting('WHATSAPP_ALERTS_ENABLED', True)
        
        alert_service = WhatsAppAlertService()
        
        return jsonify({
            'phone_number': phone_number,
            'enabled': enabled,
            'bot_initialized': alert_service.bot is not None,
            'timestamp': datetime.now().isoformat(),
            'message': 'Alert configuration retrieved successfully'
        }), 200
        
    except Exception as e:
        logger.error(f'Error getting alert status: {str(e)}')
        return jsonify({
            'phone_number': '',
            'enabled': False,
            'bot_initialized': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/whatsapp/alerts/configure', methods=['POST'])
@jwt_required()
def api_whatsapp_alerts_configure():
    """Configure WhatsApp alert settings."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        phone_number = data.get('phone_number', '').strip()
        enabled = data.get('enabled', True)
        
        # Validate phone number format
        import re
        phone_regex = r'^\+\d{10,15}$'
        
        if phone_number and not re.match(phone_regex, phone_number):
            return jsonify({
                'success': False,
                'error': f'Invalid phone number format. Expected format: +countrycode (10-15 digits). Example: +1234567890'
            }), 400
        
        # Update Database
        try:
            # Update Enabled
            setting_enabled = Settings.query.get('WHATSAPP_ALERTS_ENABLED')
            if not setting_enabled:
                setting_enabled = Settings(key='WHATSAPP_ALERTS_ENABLED', type='bool')
                db.session.add(setting_enabled)
            setting_enabled.value = str(enabled).lower()
            
            # Update Phone
            if phone_number:
                setting_phone = Settings.query.get('WHATSAPP_ALERT_PHONE')
                if not setting_phone:
                    setting_phone = Settings(key='WHATSAPP_ALERT_PHONE', type='string')
                    db.session.add(setting_phone)
                setting_phone.value = phone_number
                
            db.session.commit()
            
            logger.info(f'WhatsApp alert configuration updated: phone={phone_number}, enabled={enabled}')
            
            return jsonify({
                'success': True,
                'message': 'Alert configuration updated successfully',
                'phone_number': phone_number,
                'enabled': enabled,
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as config_error:
            db.session.rollback()
            logger.error(f'Error updating config database: {str(config_error)}')
            return jsonify({
                'success': False,
                'error': f'Failed to update configuration: {str(config_error)}'
            }), 500
    
    except Exception as e:
        logger.error(f'Error configuring alerts: {str(e)}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============= ERROR HANDLERS =============

@app.errorhandler(404)
def not_found(error):
    logger.warning(f'404 error: {request.path}')
    return jsonify({
        'error': 'Resource not found',
        'path': request.path,
        'status': 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'500 error: {str(error)}')
    return jsonify({
        'error': 'Internal server error',
        'status': 500
    }), 500

@app.errorhandler(400)
def bad_request(error):
    logger.warning(f'400 error: {str(error)}')
    return jsonify({
        'error': 'Bad request',
        'status': 400
    }), 400

# ============= MIDDLEWARE =============

@app.before_request
def before_request():
    """Log incoming requests"""
    logger.debug(f'{request.method} {request.path}')

@app.after_request
def after_request(response):
    """Log response status"""
    logger.debug(f'Response status: {response.status_code}')
    return response

# ============= MAIN =============

if __name__ == '__main__':
    logger.info('=' * 50)
    logger.info('MScheduler Flask UI Server Starting')
    logger.info('=' * 50)
    
    try:
        app.run(
            debug=app.config['DEBUG'],
            host='0.0.0.0',
            port=5000,
            threaded=True
        )
    except Exception as e:
        logger.error(f'Failed to start server: {str(e)}')
        sys.exit(1)
