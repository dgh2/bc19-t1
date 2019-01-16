@ECHO OFF
echo Compiling %~dp0bots\jstest to compiled_bot.js...
@ECHO ON
call bc19compile -d "%~dp0bots\jstest" -o compiled_bot.js
@ECHO OFF
echo.
PAUSE