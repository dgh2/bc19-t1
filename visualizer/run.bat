@ECHO OFF
echo Starting host...
start cmd /k node index.js
echo Opening http://localhost:8123/...
start "" http://localhost:8123/