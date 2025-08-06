# 📱 Haype Construction Mobile App

## 🚨 IMPORTANT: Backend Connection Setup

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address (e.g., 192.168.1.100)

### Step 2: Update API Configuration

1. Open `mobile-app/src/services/api.js`
2. Find this line:
   ```javascript
   const YOUR_COMPUTER_IP = '192.168.1.100'; // ⚠️ CHANGE THIS
   ```
3. Replace `192.168.1.100` with your actual IP address

### Step 3: Start Backend Server

Make sure your backend server is running:
```bash
npm run server
# or
npm run dev:full
```

### Step 4: Test Connection

1. Open browser on your phone
2. Go to: `http://YOUR_IP:5000`
3. You should see backend response

### Step 5: Run Mobile App

```bash
cd mobile-app
npm install
npm start
```

## 🔧 Troubleshooting

### Common Issues:

1. **Network Error**
   - ✅ Backend server running?
   - ✅ Correct IP address in api.js?
   - ✅ Phone and computer on same WiFi?
   - ✅ Firewall blocking port 5000?

2. **Connection Timeout**
   - ✅ Try different IP address
   - ✅ Restart backend server
   - ✅ Check WiFi connection

3. **Login Failed**
   - ✅ Use: admin@haype.com / password
   - ✅ Check backend logs for errors

### Test URLs:
The app will automatically try these URLs:
- `http://YOUR_IP:5000/api`
- `http://localhost:5000/api`
- `http://127.0.0.1:5000/api`
- `http://10.0.2.2:5000/api`
- `http://192.168.1.100:5000/api`

## 📱 Features

- ✅ Dashboard with business stats
- ✅ Cars management
- ✅ Customers database
- ✅ Invoice creation
- ✅ Payment processing
- ✅ Reports and analytics

## 🚀 Production Build

```bash
expo build:android  # Android APK
expo build:ios      # iOS IPA
```
</parameter>