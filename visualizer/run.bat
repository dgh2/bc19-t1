@ECHO OFF
echo Starting host...
start "Visualizer Server" cmd /k "node index.js& @ECHO OFF & echo. & PAUSE & EXIT"
echo Opening http://localhost:8123/...
start "" http://localhost:8123/