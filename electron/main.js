const { app, BrowserWindow, Menu, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let nextServer;
const PORT = 3000;
const isDev = process.env.NODE_ENV === 'development';

// Get user data directory - THIS IS WHERE ALL DATA IS STORED
// Windows: C:\Users\[Username]\AppData\Roaming\NetPOS
// Portable: Next to the .exe file in a 'NetPOS-Data' folder
function getUserDataPath() {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    // Portable mode: store data next to the .exe
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'NetPOS-Data');
  }
  // Installed mode: use AppData
  return app.getPath('userData');
}

// Copy initial database and uploads folder on first run
function initializeUserData() {
  const userDataPath = getUserDataPath();
  const appPath = isDev 
    ? path.join(__dirname, '..')
    : path.join(process.resourcesPath, 'app');

  console.log('User Data Path:', userDataPath);
  console.log('App Path:', appPath);

  // Create user data directory if it doesn't exist
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
    console.log('Created user data directory');
  }

  // Copy database if it doesn't exist in user data
  const sourceDb = path.join(appPath, 'netpos.db');
  const targetDb = path.join(userDataPath, 'netpos.db');
  
  if (!fs.existsSync(targetDb) && fs.existsSync(sourceDb)) {
    fs.copyFileSync(sourceDb, targetDb);
    console.log('Initialized database from template');
  }

  // Create uploads directory structure
  const uploadsDir = path.join(userDataPath, 'uploads');
  const uploadsDirs = [
    'uploads/products',
    'uploads/attendance',
    'uploads/audits/selfies',
    'uploads/audits/item_images',
    'uploads/cloud',
    'uploads/messaging',
    'uploads/scm',
    'uploads/csv'
  ];

  uploadsDirs.forEach(dir => {
    const fullPath = path.join(userDataPath, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  console.log('Uploads directory structure ready');

  // Copy initial uploads if they exist and user uploads is empty
  const sourceUploads = path.join(appPath, 'uploads');
  if (fs.existsSync(sourceUploads)) {
    copyDirectoryRecursive(sourceUploads, uploadsDir);
  }

  return userDataPath;
}

// Helper function to copy directories
function copyDirectoryRecursive(source, target) {
  if (!fs.existsSync(source)) return;
  
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else if (!fs.existsSync(targetPath)) {
      // Only copy if file doesn't exist (don't overwrite user data)
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// Function to start Next.js server
function startNextServer() {
  return new Promise((resolve, reject) => {
    const appPath = isDev 
      ? path.join(__dirname, '..')
      : path.join(process.resourcesPath, 'app');

    const dataPath = initializeUserData();

    console.log('Starting Next.js server...');
    console.log('App path:', appPath);
    console.log('Data will be stored in:', dataPath);

    // In development, run 'npm run dev', in production run standalone server
    if (isDev) {
      const command = 'npm';
      const args = ['run', 'dev'];

      nextServer = spawn(command, args, {
        cwd: appPath,
        env: { 
          ...process.env, 
          NODE_ENV: 'development',
          USER_DATA_PATH: dataPath
        },
        stdio: 'pipe',
        shell: true
      });
    } else {
      // Production: use standalone server
      const serverPath = path.join(appPath, '.next', 'standalone', 'server.js');
      
      if (!fs.existsSync(serverPath)) {
        reject(new Error('Standalone server not found. Did you run "npm run build"?'));
        return;
      }

      nextServer = spawn('node', [serverPath], {
        cwd: path.join(appPath, '.next', 'standalone'),
        env: { 
          ...process.env, 
          NODE_ENV: 'production',
          PORT: PORT.toString(),
          HOSTNAME: 'localhost',
          USER_DATA_PATH: dataPath
        },
        stdio: 'pipe'
      });
    }

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('Ready') || data.toString().includes('started') || data.toString().includes('Local:')) {
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      reject(error);
    });

    // Resolve after 8 seconds as fallback
    setTimeout(() => resolve(), 8000);
  });
}

function createWindow() {
  const userDataPath = getUserDataPath();
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [`--user-data-path=${userDataPath}`]
    },
    title: 'NetPOS - Retail Management System',
    icon: path.join(__dirname, '..', 'public', 'assets', 'icon.png'),
    show: false
  });

  // Remove menu bar for cleaner POS interface
  Menu.setApplicationMenu(null);

  // Load the Next.js app
  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    
    // Show data location on first run
    const firstRunFlag = path.join(userDataPath, '.first-run-complete');
    
    if (!fs.existsSync(firstRunFlag)) {
      setTimeout(() => {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'NetPOS Data Location',
          message: 'Welcome to NetPOS!',
          detail: `Your data is stored at:\n\n${userDataPath}\n\n` +
                  `This includes:\n` +
                  `• Database (netpos.db)\n` +
                  `• Uploaded files (uploads folder)\n` +
                  `• All business data\n\n` +
                  `💡 Backup this folder regularly!`,
          buttons: ['Got it!']
        });
        fs.writeFileSync(firstRunFlag, new Date().toISOString());
      }, 2000);
    }
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Wait for Next.js server to be ready before creating window
async function initialize() {
  try {
    await startNextServer();
    console.log('Next.js server started successfully');
    
    // Wait a bit more to ensure server is fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    createWindow();
  } catch (error) {
    console.error('Failed to initialize:', error);
    app.quit();
  }
}

app.whenReady().then(initialize);

app.on('window-all-closed', () => {
  // Kill Next.js server
  if (nextServer) {
    nextServer.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Clean up Next.js server
  if (nextServer) {
    nextServer.kill('SIGTERM');
  }
});
