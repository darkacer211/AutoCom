# MScheduler Codebase Analysis

## 📋 Project Overview

**MScheduler** (also referred to as AutoComm in README) is a Python-based automation system for:
- Email sending and inbox monitoring
- Rule-based email auto-reply system
- WhatsApp Web automation via Selenium
- Web dashboard for monitoring and management
- AI-powered email classification using Groq API

**Status**: In active development

---

## 🏗️ Architecture & Structure

### Directory Structure
```
MScheduler/
├── ai/                    # AI/ML components
│   └── gemini_engine.py   # Email classification using Groq API
├── config/                # Configuration management
│   └── config.py          # Credentials and API keys (⚠️ SECURITY ISSUE)
├── email_bot/             # Email automation
│   ├── sender.py          # SMTP email sending
│   ├── reader.py          # IMAP email reading
│   └── autoreplay.py      # Auto-reply logic with keyword classification
├── whatsapp_bot/          # WhatsApp automation
│   └── sender.py          # Selenium-based WhatsApp Web bot
├── scheduler/             # Job scheduling (currently empty)
│   └── jobs.py            # ⚠️ Empty file
├── web/                   # Flask web application
│   ├── app.py             # Flask routes and API endpoints
│   ├── templates/         # Jinja2 HTML templates
│   └── static/            # CSS and JavaScript
├── database/              # ⚠️ Empty directory (planned SQLite)
└── logs/                  # Application logs
```

---

## 🔧 Core Components

### 1. **AI Email Classification** (`ai/gemini_engine.py`)
- **Purpose**: Classifies emails into categories (CRITICAL, OFFICIAL, SAFE, SPAM, UNCERTAIN)
- **Technology**: Groq API (using `openai/gpt-oss-120b` model)
- **Features**:
  - Risk level assessment (0.0-1.0)
  - Suggested auto-replies for SAFE emails
  - JSON response parsing with error handling
- **Issues**:
  - File name suggests "gemini" but uses Groq API (misleading)
  - Hardcoded API key in config (security risk)
  - No rate limiting or retry logic
  - Fallback returns UNCERTAIN on API failure

### 2. **Email Automation** (`email_bot/`)

#### `sender.py`
- **Purpose**: Send emails via SMTP (Gmail)
- **Features**:
  - Simple email sending with EmailMessage
  - Logging to `logs/bot.log`
  - Basic error handling
- **Issues**:
  - No email validation
  - No attachment support
  - Hardcoded credentials

#### `reader.py`
- **Purpose**: Fetch unread emails via IMAP
- **Features**:
  - Fetches latest N unread emails (default: 2)
  - Parses email body (handles multipart)
  - Returns structured email data
- **Issues**:
  - Limited to plain text extraction
  - No HTML email support
  - No email marking as read
  - Hardcoded credentials

#### `autoreplay.py`
- **Purpose**: Rule-based email classification and auto-reply
- **Features**:
  - Keyword-based classification (CRITICAL, OFFICIAL, SPAM, SAFE, UNCERTAIN)
  - Auto-reply for SAFE emails
  - User notification for important emails
  - Action logging
- **Issues**:
  - Simple keyword matching (no ML/AI integration despite having AI module)
  - No integration with `gemini_engine.py`
  - Hardcoded reply template
  - No spam filtering sophistication

### 3. **WhatsApp Bot** (`whatsapp_bot/sender.py`)
- **Purpose**: Send WhatsApp messages via Selenium WebDriver
- **Technology**: Selenium with Chrome/Brave browser
- **Features**:
  - QR code login support
  - Contact search and message sending
  - Screenshot capture (before/after send)
  - Multiple send button detection strategies
- **Issues**:
  - Requires manual QR code scanning (not fully automated)
  - Hardcoded wait times (fragile)
  - No error recovery for WhatsApp Web changes
  - Browser path must be provided manually
  - No message scheduling
  - No contact management

### 4. **Web Dashboard** (`web/app.py`)
- **Purpose**: Flask-based web interface for monitoring
- **Features**:
  - Dashboard with stats (active/completed/failed jobs)
  - RESTful API endpoints:
    - `/api/status` - System status
    - `/api/dashboard` - Dashboard stats
    - `/api/jobs` - Job management (GET/POST)
    - `/api/logs` - Log retrieval
    - `/api/health` - Health check
  - CORS enabled
  - Error handling (404, 500, 400)
  - Request/response logging
- **Issues**:
  - In-memory state (not persistent)
  - Empty job list endpoints (no actual job storage)
  - No authentication/authorization
  - No database integration
  - Dashboard UI incomplete (no real data binding)

### 5. **Scheduler** (`scheduler/jobs.py`)
- **Status**: ⚠️ **EMPTY FILE** - Core functionality missing
- **Expected**: Job scheduling, cron-like functionality, task queue

### 6. **Configuration** (`config/config.py`)
- **Purpose**: Centralized configuration
- **Content**:
  - Email credentials (Gmail)
  - SMTP/IMAP server settings
  - API keys (Groq, Gemini)
- **Issues**:
  - ⚠️ **CRITICAL**: Hardcoded credentials and API keys
  - No environment variable support
  - Should use `.env` file with `python-dotenv` (already in requirements)
  - Exposed in version control (security risk)

---

## 📦 Dependencies

### Current Dependencies (`requirements.txt`)
- **Selenium** (4.39.0) - Web automation
- **Flask** (3.0.0) - Web framework
- **Flask-CORS** (4.0.0) - CORS support
- **python-dotenv** (1.0.0) - Environment variables (⚠️ not used)

### Missing Dependencies
- ⚠️ **groq** - Required by `ai/gemini_engine.py` but not in requirements.txt
- ⚠️ **apscheduler** or **schedule** - For job scheduling (scheduler module is empty)

---

## 🔒 Security Concerns

### Critical Issues
1. **Hardcoded Credentials** (`config/config.py`)
   - Email password exposed
   - API keys exposed
   - Should use environment variables

2. **No Authentication**
   - Web dashboard has no login
   - API endpoints are publicly accessible

3. **No Input Validation**
   - Email addresses not validated
   - No sanitization of user inputs
   - SQL injection risk (when database is added)

4. **Logging Sensitive Data**
   - Email content may be logged
   - No data masking

### Recommendations
- Move all secrets to `.env` file
- Add `.env` to `.gitignore`
- Implement authentication (Flask-Login)
- Add input validation and sanitization
- Use environment variables in production

---

## 🐛 Issues & Technical Debt

### Code Quality Issues
1. **Inconsistent Error Handling**
   - Some modules have try/except, others don't
   - Error messages not standardized

2. **No Logging Standardization**
   - Mix of `print()` and file logging
   - No log rotation
   - No log levels properly used

3. **Hardcoded Values**
   - Wait times in WhatsApp bot
   - Email limit in reader
   - Server ports and addresses

4. **Missing Type Hints**
   - No type annotations
   - Harder to maintain

5. **No Unit Tests**
   - No test files found
   - No test coverage

6. **Incomplete Integration**
   - `autoreplay.py` doesn't use `gemini_engine.py`
   - Two classification systems (keyword vs AI) not unified
   - Scheduler module empty

### Architecture Issues
1. **No Database**
   - Planned SQLite but not implemented
   - All state in memory
   - No persistence

2. **No Job Queue**
   - Scheduler module empty
   - No background task processing
   - No retry mechanism

3. **No Configuration Management**
   - Config file has hardcoded values
   - No environment-based configs
   - No config validation

---

## 🚀 Missing Features

### Planned but Not Implemented
1. **Database Integration**
   - Contact management
   - Job history
   - Log persistence

2. **Job Scheduling**
   - Cron-like scheduling
   - Recurring tasks
   - Job queue system

3. **Email Features**
   - HTML email support
   - Attachment handling
   - Email templates
   - Rich formatting

4. **WhatsApp Features**
   - Message scheduling
   - Group messaging
   - Media sending
   - Contact management

5. **Dashboard Features**
   - Real-time updates
   - Job creation UI
   - Log viewer
   - Settings page

6. **AI Integration**
   - Use `gemini_engine.py` in `autoreplay.py`
   - Smart reply suggestions
   - Spam detection improvement

---

## 📊 Code Statistics

- **Total Python Files**: ~10
- **Lines of Code**: ~600-700 (estimated)
- **Modules**: 5 main modules (ai, email_bot, whatsapp_bot, scheduler, web)
- **Test Coverage**: 0%
- **Documentation**: Minimal (README only)

---

## 🎯 Recommendations

### Immediate Actions
1. **Security**
   - Move credentials to `.env` file
   - Add `.env` to `.gitignore`
   - Implement environment variable loading

2. **Dependencies**
   - Add `groq` to `requirements.txt`
   - Add scheduling library (e.g., `apscheduler`)

3. **Integration**
   - Integrate `gemini_engine.py` into `autoreplay.py`
   - Implement scheduler module
   - Add database layer

### Short-term Improvements
1. **Code Quality**
   - Add type hints
   - Standardize error handling
   - Implement proper logging
   - Add input validation

2. **Testing**
   - Write unit tests
   - Add integration tests
   - Set up CI/CD

3. **Documentation**
   - Add docstrings
   - Create API documentation
   - Update README with setup instructions

### Long-term Enhancements
1. **Features**
   - Complete scheduler implementation
   - Add database persistence
   - Implement authentication
   - Add job queue system

2. **Scalability**
   - Add Redis for job queue
   - Implement worker processes
   - Add monitoring and metrics

3. **User Experience**
   - Complete dashboard UI
   - Add real-time updates
   - Improve error messages
   - Add user guides

---

## 📝 Conclusion

**MScheduler** is a promising automation project with a solid foundation but requires significant work to be production-ready. The main areas of concern are:

1. **Security**: Hardcoded credentials must be moved to environment variables
2. **Completeness**: Scheduler module and database integration are missing
3. **Integration**: AI classification not integrated with auto-reply system
4. **Testing**: No test coverage
5. **Documentation**: Minimal documentation

The project shows good modular design but needs completion of core features and security hardening before deployment.

---

**Analysis Date**: 2026-01-27
**Analyzed By**: Codebase Analysis Tool
