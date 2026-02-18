@echo off
REM MScheduler Flask UI Server Startup Script

echo.
echo ================================
echo MScheduler Flask UI Server
echo ================================
echo.

REM Check if logs directory exists
if not exist "logs" (
    mkdir logs
    echo Created logs directory
)

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo Warning: Virtual environment not found
)

REM Install/update requirements
echo.
echo Installing dependencies...
pip install -r requirements.txt -q

REM Start the Flask server
echo.
echo Starting Flask server...
echo Server will be available at http://localhost:5000
echo.

cd web
python app.py

pause
