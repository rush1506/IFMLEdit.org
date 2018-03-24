if exist node_modules\almost-joint (rmdir /s /q node_modules\almost-joint) 
if exist ..\almostjs-joint (cd ..\almostjs-joint && gulp && cd ..\IFMLEdit.org) else GOTO MissingLocalPackage

:MissingLocalPackage
ECHO "Cannot find local package almostjs-joint"
@ECHO OFF
SET /P choice=Do you want to install the missing package?(y/n): 
IF "%choice%"=="" GOTO NoInputError
IF "%choice%"=="y" GOTO Yes
IF "%choice%"=="Y" GOTO Yes
IF "%choice%"=="yes" GOTO Yes
IF "%choice%"=="n" GOTO End
IF "%choice%"=="no" GOTO End
IF "%choice%"=="N" GOTO End
GOTO NoInputError
:Yes
WHERE git >nul 2>nul
IF %ERRORLEVEL% NEQ 0 GOTO GitError  
cd .. 
git clone https://github.com/rush1506/almostjs-joint && cd almostjs-joint && npm install && cd ..\IFMLEdit.org
GOTO End
:NoInputError
ECHO Cannot catch that... 
GOTO End
:GitError
ECHO cannot find git! Aborting...
:End 