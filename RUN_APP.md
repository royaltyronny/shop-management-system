# Sunrise Shop - Installation & Usage Guide

## ✅ Quick Start

### Running the Application

The built executable file is located at:
```
dist/win-unpacked/shop-management-app.exe
```

**To run the app:**
1. Double-click `shop-management-app.exe`
2. The app will open in a new window

### Initial Login

Use the following credentials to log in:

- **Username:** `admin`
- **Password:** `admin123`

---

## 📁 Database Location

The application uses SQLite for data storage. The database file is automatically created at:

```
<AppDataLocal>\Sunrise Shop\database\shop.db
```

Or in your project folder:
```
database/shop.db
```

**Note:** The database is automatically initialized on first run with:
- Default admin user
- 3 sample suppliers
- 10 sample products
- All necessary tables and indexes

---

## 🎯 Features

### ✨ Dashboard
- Real-time inventory overview
- Stock alerts for low-inventory items
- Smart restocking recommendations
- Financial performance metrics

### 📦 Inventory Management
- Advanced filtering (Critical, Warning, Healthy, Slow-moving)
- Real-time search
- Stock adjustment with audit trail
- Movement history tracking
- CSV export functionality

### 🛒 Sales Module
- Quick product search
- Fast checkout process
- Multiple payment methods (Cash, Card, Mobile Money)
- Automatic inventory updates

### 👥 User Management
- Role-based access control (Admin, Manager, Cashier)
- User creation and management
- Password management
- Activity tracking

### 📊 Analytics
- Days of supply calculations
- Monthly turnover metrics
- Profit margin analysis
- Stock health indicators

---

## ⚙️ System Requirements

- **OS:** Windows 10 or later
- **Memory:** 4GB RAM minimum
- **Storage:** 500MB free space
- **No additional software required** - Everything is bundled

---

## 🔧 Troubleshooting

### App Won't Start
- Ensure you have Windows 10 or later
- Try running as Administrator
- Check that port 5173 is available

### Database Errors
- Delete the database folder if corrupted
- App will automatically recreate and reseed on next start

### Permission Denied Errors
- Run the app as Administrator
- Check if antivirus is blocking the app

---

## 📝 Default Data

When you first run the app, it creates:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: Administrator

**Sample Suppliers:**
1. Premium Wholesale Co.
2. Quality Imports Ltd.
3. Direct Factory Supply

**Sample Products:**
- Premium Coffee Beans
- Organic Green Tea
- Dark Chocolate Bars
- Honey - Raw & Unfiltered
- Almond Butter - Natural
- And 5 more premium items

---

## 💡 Tips

1. **First Login:** Change your password after first login for security
2. **Backup:** Regularly backup your database file for important data
3. **Multiple Users:** Create additional user accounts for staff with appropriate roles
4. **Inventory:** Use the inventory alerts to maintain optimal stock levels
5. **Reports:** Export CSV regularly to keep records

---

## 🆘 Need Help?

If you encounter any issues:
1. Ensure the database folder has write permissions
2. Try restarting the application
3. Check if all dependencies are properly installed (should be automatic)

---

**Version:** 1.0.0
**Last Updated:** January 16, 2026
