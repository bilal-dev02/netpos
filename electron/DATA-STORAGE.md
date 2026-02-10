# 📁 NetPOS Data Storage Guide

## Where Is Your Data Stored?

When you send the .exe to someone, here's exactly what happens:

### **Installer Version** (NetPOS-0.1.0-win-x64.exe)

**Data Location:**
```
C:\Users\[Username]\AppData\Roaming\NetPOS\
```

**What's stored there:**
- `netpos.db` - All your business data (products, orders, invoices, users, etc.)
- `uploads/` folder - All uploaded files:
  - `uploads/products/` - Product images
  - `uploads/attendance/` - Employee attendance selfies
  - `uploads/audits/` - Audit photos and videos
  - `uploads/cloud/` - User cloud files
  - `uploads/messaging/` - Message attachments
  - `uploads/scm/` - Supplier documents and purchase orders
  - `uploads/csv/` - Imported CSV files

**Benefits:**
- ✅ Data persists even if you uninstall the app
- ✅ Each Windows user has their own data
- ✅ Data survives app updates
- ✅ Protected in standard Windows backup

---

### **Portable Version** (NetPOS-0.1.0-Portable.exe)

**Data Location:**
```
[Wherever you put the .exe]\NetPOS-Data\
```

**Example:** If you put the .exe on Desktop:
```
C:\Users\YourName\Desktop\NetPOS-Data\
```

**Benefits:**
- ✅ All data stays next to the .exe
- ✅ Perfect for USB drives - take everything with you
- ✅ Easy to find and backup (just copy the folder)
- ✅ Multiple copies on different USB drives = instant backup

---

## 📊 What Data Is Included?

### **Initial Database**
- When someone runs NetPOS for the first time, they get a fresh copy of your `netpos.db`
- This includes any products, settings, or users you defined
- After that, ALL changes are saved to THEIR local database

### **Initial Uploads**
- Any files in your `uploads/` folder are copied on first run
- This means you can pre-load product images!

---

## 🔄 Multi-Store Deployment Scenarios

### **Scenario 1: Each Store Has Its Own Data**
✅ **Best for:** Independent stores, franchises

**Setup:**
1. Send the same .exe to each store
2. Each store gets their own fresh database
3. They manage their own inventory and sales

### **Scenario 2: All Stores Share Same Initial Setup**
✅ **Best for:** Chain stores with same products

**Setup:**
1. Set up products, prices, users in YOUR database
2. Build the .exe with this pre-configured database
3. Send to all stores
4. Each store starts with the same products but tracks sales separately

### **Scenario 3: Central + Local (Manual Sync)**
✅ **Best for:** Periodic data collection

**Setup:**
1. Each store uses portable version on USB drive
2. Weekly: Collect USB drives from all stores
3. Copy their `NetPOS-Data` folders to your PC
4. Merge databases manually or with scripts

---

## 💾 Backup Strategies

### **For Installer Version:**
Create a backup script (`backup-netpos.bat`):
```batch
@echo off
set APPDATA_PATH=%APPDATA%\NetPOS
set BACKUP_PATH=%USERPROFILE%\Documents\NetPOS-Backups
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%

mkdir "%BACKUP_PATH%\%DATE%"
xcopy "%APPDATA_PATH%\*.*" "%BACKUP_PATH%\%DATE%\" /E /I /Y

echo Backup completed to %BACKUP_PATH%\%DATE%
pause
```

### **For Portable Version:**
- Just copy the entire `NetPOS-Data` folder!
- Zip it and save to cloud/external drive

---

## 🔍 Finding Your Data Folder

### **Manually:**
**Installer version:**
1. Press `Win + R`
2. Type: `%APPDATA%\NetPOS`
3. Press Enter

**Portable version:**
- Look for `NetPOS-Data` folder next to the .exe

### **From the App:**
- On first launch, NetPOS shows a popup with the exact data location
- The popup includes full path and what's stored there

---

## 🚨 Important Notes

1. **Database is SQLite**
   - Single file (`netpos.db`)
   - Can be opened with DB Browser for SQLite
   - Easy to backup (just copy the file)

2. **Uploads are Local Files**
   - Not embedded in database
   - Paths are stored in database
   - Must backup both database AND uploads folder

3. **Uninstalling** (Installer version)
   - Uninstalling the app does NOT delete your data
   - Data stays in AppData unless you manually delete it
   - Reinstalling reconnects to existing data

4. **Moving to Another PC**
   - Copy the entire data folder
   - Paste it to the same location on new PC
   - Install/run NetPOS - it will find your data

5. **Multiple Instances**
   - You can run multiple portable versions with different data
   - Just put them in different folders

---

## 🎯 Quick Reference

| Version | Data Location | Best For | Backup Method |
|---------|--------------|----------|---------------|
| **Installer** | `%APPDATA%\NetPOS` | Permanent installation | Script/Cloud sync |
| **Portable** | Next to .exe | USB drives, multi-store | Copy folder |

---

## 📝 Example File Structure

```
NetPOS Data Folder/
├── netpos.db (ALL your business data)
├── uploads/
│   ├── products/
│   │   ├── prod-123-image.jpg
│   │   └── prod-456-image.png
│   ├── attendance/
│   │   └── 2026-02-10-user-5-checkin.jpg
│   ├── audits/
│   ├── cloud/
│   ├── messaging/
│   ├── scm/
│   └── csv/
└── .first-run-complete (flag file)
```

**Everything in this folder = All your business data!**

Protect it like your cash register! 💰
