# Icon Files for NetPOS

Place your application icons in the `public/assets` folder:

## Required Icons:

### Windows
- **icon.ico** - Windows icon file (256x256px recommended)
  - Used for the .exe file and taskbar
  - Can be created from PNG using online converters

### macOS
- **icon.icns** - macOS icon file
  - Required if building for Mac

### Linux
- **icon.png** - PNG icon (512x512px or 1024x1024px)
  - Used for Linux AppImage

## Quick Icon Generation

If you don't have icons yet, you can:

1. **Create a simple icon:**
   - Design a 512x512px PNG logo for your app
   - Save it as `public/assets/icon.png`

2. **Convert to other formats:**
   - Use https://convertio.co/png-ico/ for .ico
   - Use https://cloudconvert.com/png-to-icns for .icns

3. **Temporary solution:**
   - Copy any PNG from your project
   - Rename to icon.png, icon.ico, icon.icns
   - The app will build (but with a generic icon)

## Current Status
The electron-builder.json references:
- Windows: `public/assets/icon.ico`
- Mac: `public/assets/icon.icns`
- Linux: `public/assets/icon.png`

Place your icons there before building, or the build will use default Electron icon.
