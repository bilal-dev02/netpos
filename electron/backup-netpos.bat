@echo off
echo ================================================
echo NetPOS Data Backup Script
echo ================================================
echo.

REM Check if NetPOS data exists
set NETPOS_DATA=%APPDATA%\NetPOS
if not exist "%NETPOS_DATA%" (
    echo Error: NetPOS data folder not found at:
    echo %NETPOS_DATA%
    echo.
    echo Make sure NetPOS has been run at least once.
    pause
    exit /b 1
)

REM Create backup directory with timestamp
set BACKUP_ROOT=%USERPROFILE%\Documents\NetPOS-Backups
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=%BACKUP_ROOT%\Backup_%TIMESTAMP%

echo Creating backup directory...
mkdir "%BACKUP_DIR%" 2>nul

echo.
echo Copying database...
copy "%NETPOS_DATA%\netpos.db" "%BACKUP_DIR%\netpos.db" >nul

echo Copying uploads folder...
xcopy "%NETPOS_DATA%\uploads" "%BACKUP_DIR%\uploads\" /E /I /Y /Q >nul

echo.
echo ================================================
echo Backup Complete!
echo ================================================
echo.
echo Backup saved to:
echo %BACKUP_DIR%
echo.
echo Contents:
echo - netpos.db (complete database)
echo - uploads folder (all files)
echo.
echo To restore: Copy these files back to %APPDATA%\NetPOS
echo.

REM Open backup folder
explorer "%BACKUP_DIR%"

pause
