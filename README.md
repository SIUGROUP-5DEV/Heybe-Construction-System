# Haype Construction Management System

Complete business management solution with Web, Mobile, and Desktop applications.

## 🚀 Applications

### 1. Web Application (React)
- **Location**: `/src/`
- **Technology**: React + Tailwind CSS
- **Features**: Full-featured web interface
- **Run**: `npm run dev`

### 2. Mobile Application (React Native + Expo)
- **Location**: `/mobile-app/`
- **Technology**: React Native + Expo + React Native Paper
- **Features**: Native mobile experience
- **Run**: 
  ```bash
  cd mobile-app
  npm install
  npm start
  ```

### 3. Desktop Application (Electron)
- **Location**: `/desktop-app/`
- **Technology**: React + Electron + Material-UI
- **Features**: Native desktop application
- **Run**:
  ```bash
  cd desktop-app
  npm install
  npm run electron-dev
  ```

## 📱 Mobile App Features

### Core Functionality
- ✅ **Authentication**: Secure login with token storage
- ✅ **Dashboard**: Business overview with statistics
- ✅ **Cars Management**: Fleet management on mobile
- ✅ **Customers**: Customer database access
- ✅ **Invoices**: Create and manage invoices
- ✅ **Payments**: Payment processing
- ✅ **Reports**: Mobile-friendly reports

### Mobile-Specific Features
- ✅ **Bottom Tab Navigation**: Easy mobile navigation
- ✅ **Pull to Refresh**: Refresh data with pull gesture
- ✅ **Responsive Design**: Optimized for all screen sizes
- ✅ **Offline Storage**: AsyncStorage for auth tokens
- ✅ **Native Icons**: Material Design icons
- ✅ **Touch-Friendly**: Large buttons and touch targets

## 🖥️ Desktop App Features

### Core Functionality
- ✅ **Native Menus**: File, View, Window, Help menus
- ✅ **Keyboard Shortcuts**: Productivity shortcuts
- ✅ **Window Management**: Minimize, maximize, close
- ✅ **Auto-Updates**: Built-in update mechanism
- ✅ **Cross-Platform**: Windows, macOS, Linux support

### Desktop-Specific Features
- ✅ **Menu Bar**: Native application menus
- ✅ **Keyboard Shortcuts**:
  - `Ctrl/Cmd + N`: New Invoice
  - `Ctrl/Cmd + D`: Dashboard
  - `Ctrl/Cmd + 1-3`: Navigate sections
- ✅ **Window Controls**: Native window management
- ✅ **System Integration**: OS-level integration

## 🔗 Backend Connection

All applications connect to the same backend API:

### API Configuration
```javascript
// Update these URLs in each app:
// Web: src/services/api.js
// Mobile: mobile-app/src/services/api.js  
// Desktop: desktop-app/src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend URL
```

### Shared API Endpoints
- ✅ **Authentication**: `/auth/login`, `/auth/verify`
- ✅ **Cars**: `/cars` (CRUD operations)
- ✅ **Customers**: `/customers` (CRUD operations)
- ✅ **Invoices**: `/invoices` (CRUD operations)
- ✅ **Payments**: `/payments` (receive, payment-out)
- ✅ **Dashboard**: `/dashboard` (statistics)

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI (for mobile)
- Electron (for desktop)

### Quick Start

1. **Web Application**:
   ```bash
   npm install
   npm run dev
   ```

2. **Mobile Application**:
   ```bash
   cd mobile-app
   npm install
   npm start
   # Scan QR code with Expo Go app
   ```

3. **Desktop Application**:
   ```bash
   cd desktop-app
   npm install
   npm run electron-dev
   ```

## 📦 Building for Production

### Mobile App (APK/IPA)
```bash
cd mobile-app
expo build:android  # For Android APK
expo build:ios      # For iOS IPA
```

### Desktop App (Executable)
```bash
cd desktop-app
npm run electron-pack  # Creates installer
```

## 🎯 Key Features Across All Platforms

### Business Management
- ✅ **Fleet Management**: Car tracking and management
- ✅ **Customer Database**: Complete customer records
- ✅ **Invoice Generation**: Professional invoice creation
- ✅ **Payment Processing**: Payment tracking and management
- ✅ **Financial Reports**: Comprehensive reporting
- ✅ **Dashboard Analytics**: Business insights

### Technical Features
- ✅ **Real-time Sync**: All platforms sync with same backend
- ✅ **Offline Capability**: Local storage for critical data
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Security**: JWT authentication across platforms
- ✅ **Performance**: Optimized for each platform

## 🔧 Configuration

### Backend URL Configuration
Update the API URL in each application:

1. **Web**: `src/services/api.js`
2. **Mobile**: `mobile-app/src/services/api.js`
3. **Desktop**: `desktop-app/src/services/api.js`

### Environment Variables
Create `.env` files for each application with your backend URL:

```env
# Web app
VITE_API_URL=http://your-backend-url/api

# Desktop app  
REACT_APP_API_URL=http://your-backend-url/api

# Mobile app (update directly in api.js)
```

## 📱 Mobile App Screenshots
- Dashboard with business statistics
- Car management interface
- Invoice creation on mobile
- Payment processing
- Reports and analytics

## 🖥️ Desktop App Screenshots
- Native desktop interface
- Menu bar integration
- Keyboard shortcuts
- Window management
- Professional desktop experience

## 🚀 Deployment

### Web App
- Deploy to Vercel, Netlify, or any static hosting
- Build: `npm run build`

### Mobile App
- Publish to App Store / Google Play
- Use Expo Application Services (EAS)

### Desktop App
- Distribute as installer files
- Support for Windows, macOS, Linux
- Auto-update capability included

---

**Haype Construction Management System** - Complete business solution across all platforms! 🏗️📱💻