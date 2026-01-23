# Sunrise Shop Management System - Setup & Login Guide

## ✅ Application Successfully Built!

Your Sunrise Shop Management application has been built and is ready to use.

### 📥 How to Launch the Application

**Option 1: Using the Batch File (Easiest)**
1. Navigate to the application folder
2. Double-click `LAUNCH_APP.bat`
3. The app will launch in a few seconds

**Option 2: Direct Executable**
1. Navigate to: `dist\win-unpacked\`
2. Double-click `shop-management-app.exe`

### 🔐 Default Login Credentials

```
Username: admin
Password: admin123
```

> ⚠️ **Important:** These are the default credentials created when you first launch the app. Change them immediately in the Settings page for security!

### 📦 What's Installed

- **Location:** `C:\Users\[YourUsername]\AppData\Roaming\Sunrise Shop\`
- **Database File:** `shop.db` (SQLite database with auto-backup WAL files)
- **Auto-Initialized:** The application automatically creates:
  - Database schema
  - Admin user account
  - Sample suppliers and products

### ✨ Features Available

1. **Dashboard & Inventory**
   - Real-time stock monitoring
   - Low-stock alerts
   - Stock adjustment with audit trail
   - Advanced filtering (critical, warning, healthy, slow-moving)
   - Search by product name or ID
   - Stock movement history
   - CSV export

2. **Product Management**
   - Add/edit/delete products
   - Track cost and selling prices
   - Set minimum stock levels
   - Monitor profit margins

3. **Sales & Purchases**
   - Record sales transactions
   - Manage purchase orders
   - Track supplier interactions

4. **User Management**
   - Add users with different roles
   - Manage permissions
   - Change passwords

5. **Reporting**
   - Sales analytics
   - Inventory reports
   - Stock movement history
   - Export data to CSV

### 🔧 Troubleshooting

#### Issue: "Invalid user or password" error
**Solution:**
1. Delete the database: `C:\Users\[YourUsername]\AppData\Roaming\Sunrise Shop\`
2. Restart the application
3. Use credentials: `admin` / `admin123`

#### Issue: App won't start
**Solution:**
1. Ensure you have Windows 10 or later
2. Check if port 5173 is available (development build only)
3. Run the application as Administrator if you get permission errors

#### Issue: Database not initializing
**Solution:**
1. Check if you have write permissions to `AppData\Roaming\Sunrise Shop\`
2. Delete the folder and let the app recreate it
3. Restart the application

### 📝 Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Electron + Node.js
- **Database:** SQLite (better-sqlite3)
- **UI Components:** shadcn/ui + Tailwind CSS
- **Build:** Electron Builder

### 🔄 Development Info

If you want to run the development version:
```bash
npm run dev
```

This will start both the main and renderer processes with hot reload enabled.

### 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs in AppData folder
3. Ensure all dependencies are installed: `npm install`

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Status:** ✅ Production Ready
