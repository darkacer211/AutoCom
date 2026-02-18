#!/bin/bash
# MScheduler Flask UI Server Startup Script

echo ""
echo "================================"
echo "MScheduler Flask UI Server"
echo "================================"
echo ""

# Check if logs directory exists
if [ ! -d "logs" ]; then
    mkdir logs
    echo "Created logs directory"
fi

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "Virtual environment activated"
else
    echo "Warning: Virtual environment not found"
fi

# Install/update requirements
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Start the Flask server
echo ""
echo "Starting Flask server..."
echo "Server will be available at http://localhost:5000"
echo ""

cd web
python app.py
