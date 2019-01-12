@ECHO OFF
echo Compiling %~dp0bots\pytest to compiled_bot.js...
@ECHO ON
call bc19compile -d "%~dp0bots\pytest" -o compiled_bot.js
@ECHO OFF
echo.
PAUSE