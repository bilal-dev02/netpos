# NetPOS Desktop Application

## Building the Desktop App

### Prerequisites
Install dependencies first:
```bash
npm install
```

### Development Mode
Run the app in development mode with hot reload:
```bash
npm run electron:dev
```

### Build Executable

#### Build for Windows (creates installer + portable):
```bash
npm run electron:build:win
```

This creates:
- `NetPOS-0.1.0-win-x64.exe` - Installer
- `NetPOS-0.1.0-Portable.exe` - Portable version (no installation needed)

#### Build for current platform:
```bash
npm run electron:build
```

#### Build portable version only:
```bash
npm run electron:build:portable
```

### Output Location
Built executables will be in the `dist-electron` folder.

### What You Get

**Installer Version:**
- Installs to Program Files
- Creates desktop shortcut
- Creates Start Menu entry
- Can be uninstalled via Windows Settings

**Portable Version:**
- Single .exe file
- No installation required
- Can run from USB drive
- Perfect for deployment to multiple stores

### Distribution
Simply copy the `.exe` file to any Windows computer and run it. No Node.js or other dependencies needed - everything is bundled!

### Database & Uploads

**📁 Data Storage Locations:**

#### **Installer Version:**
```
C:\Users\[Username]\AppData\Roaming\NetPOS\
├── netpos.db (all business data)
└── uploads/ (all files)
```

#### **Portable Version:**
```
[Next to the .exe]\NetPOS-Data\
├── netpos.db (all business data)
└── uploads/ (all files)
```

**Key Points:**
- ✅ Data persists between app restarts
- ✅ Each user gets their own fresh database on first run
- ✅ Your configured products/settings are copied initially
- ✅ After that, each installation is independent
- ✅ On first launch, app shows exact data location

**Helper Scripts Included:**
- `backup-netpos.bat` - Creates timestamped backups to Documents
- `find-data-folder.bat` - Shows data location and opens folder

See [DATA-STORAGE.md](DATA-STORAGE.md) for complete details!

### Notes
- First launch may take a few seconds
- The app runs on port 3000 internally
- No internet connection required for core functionality
- Firebase features require internet
