@ECHO OFF
echo Uploading, please wait:
setlocal
FOR /F "tokens=1,2 delims==" %%G IN (bc19.properties) DO (set %%G=%%H)
set BC_USERNAME=%BC_USERNAME%
set BC_PASSWORD=%BC_PASSWORD%
@ECHO ON
call bc19upload -i compiled_bot.js
@ECHO OFF
endlocal
echo.
PAUSE