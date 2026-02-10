@echo off
echo ================================================
echo NetPOS Data Location Finder
echo ================================================
echo.

REM For Installer Version
set INSTALLED_DATA=%APPDATA%\NetPOS
echo [Installer Version Data]
if exist "%INSTALLED_DATA%" (
    echo Status: FOUND
    echo Location: %INSTALLED_DATA%
    echo.
    echo Contents:
    if exist "%INSTALLED_DATA%\netpos.db" (
        echo   [X] Database (netpos.db) - Size: 
        for %%A in ("%INSTALLED_DATA%\netpos.db") do echo       %%~zA bytes
    ) else (
        echo   [ ] Database not found
    )
    if exist "%INSTALLED_DATA%\uploads" (
        echo   [X] Uploads folder
    ) else (
        echo   [ ] Uploads folder not found
    )
) else (
    echo Status: NOT FOUND
    echo NetPOS has not been run yet in installer mode.
)

echo.
echo ================================================
echo.

REM For Portable Version
echo [Portable Version Data]
echo Look for "NetPOS-Data" folder next to NetPOS.exe
echo Common locations:
echo   - Desktop\NetPOS-Data\
echo   - Downloads\NetPOS-Data\
echo   - USB Drive\NetPOS-Data\
echo.

echo ================================================
echo.
echo Press any key to open the data folder...
pause >nul

if exist "%INSTALLED_DATA%" (
    explorer "%INSTALLED_DATA%"
) else (
    echo Cannot open - data folder doesn't exist yet.
    pause
)
