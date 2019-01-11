@ECHO OFF
echo Uploading, please wait:
setlocal
set BC_USERNAME=*
set BC_PASSWORD=*
@ECHO ON
call bc19upload -i compiled_bot.js
@ECHO OFF
endlocal
echo.
PAUSE