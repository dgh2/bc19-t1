@ECHO OFF

echo Prompting for bot directories...

set "psCommand1="(new-object -COM 'Shell.Application')^
.BrowseForFolder(0,'Please choose the directory containing the first bot.',0,'%cd%').self.path""
for /f "usebackq delims=" %%I in (`powershell %psCommand1%`) do set "bot1=%%I"

IF "%bot1%"=="" (
echo No directory selected. Exiting...
PAUSE
EXIT
)
echo First bot directory: %bot1%

set "psCommand2="(new-object -COM 'Shell.Application')^
.BrowseForFolder(0,'Please choose the directory containing the second bot.',0,'%cd%').self.path""
for /f "usebackq delims=" %%I in (`powershell %psCommand2%`) do set "bot2=%%I"

IF "%bot2%"=="" (
echo No directory selected. Exiting...
PAUSE
EXIT
)
echo Second bot directory: %bot2%
echo Running bc19...
@ECHO ON
call bc19run -b "%bot1%" -r "%bot2%" --chi 1000
@ECHO OFF
PAUSE