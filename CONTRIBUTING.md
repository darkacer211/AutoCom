# Contributing to MScheduler

We welcome contributions to MScheduler! Please follow these guidelines:

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/MScheduler.git
cd MScheduler
```

2. Set up the development environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

3. Set up frontend
```bash
cd frontend
npm install
```

## Running Locally

### Start Backend
```bash
cd web
python app.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

Both servers will run:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Making Changes

1. Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test thoroughly

3. Commit with clear messages
```bash
git commit -m "Add feature description"
```

4. Push and create a Pull Request
```bash
git push origin feature/your-feature-name
```

## Code Guidelines

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add docstrings to functions
- Include comments for complex logic
- Write tests for new features

## Reporting Issues

Please use the GitHub Issues tab to report bugs or suggest features. Include:
- Clear description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details (OS, Python version, etc.)

## Documentation

Updates to documentation are welcome! Check the [docs/](docs/) directory for existing documentation.

Thank you for contributing! 🎉
