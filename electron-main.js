/**
 * ⚡ ELKHETA Enterprise Windows Desktop Workstation
 * النسخة الرسمية لتطبيق الكمبيوتر المكتبي لمنصة «الخطة التعليمية»
 * مطابقة 100% لتصميم وتجربة موقع الويب (Turkish Coffee & Warm Café Edition)
 */

const { app, BrowserWindow, ipcMain, globalShortcut, Menu, shell, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let splashWindow = null;
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// 1. إنشاء شاشة الإقلاع (Splash Screen) لمدة 3 ثوانٍ
function createSplashScreen() {
    splashWindow = new BrowserWindow({
        width: 500,
        height: 340,
        center: true,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        resizable: false,
        backgroundColor: '#00000000',
        icon: path.join(__dirname, 'icons', 'icon-512.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    splashWindow.loadFile(path.join(__dirname, 'splash.html')).catch(() => {});
}

// 2. إنشاء النافذة الرئيسية المطابقة تماماً لتصميم موقع الويب
function createMainWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({
        width: Math.min(1400, screenWidth),
        height: Math.min(900, screenHeight),
        minWidth: 1000,
        minHeight: 650,
        center: true,
        show: false,
        title: "منصة الخطة التعليمية | ELKHETA",
        backgroundColor: '#FDFBF7',
        icon: path.join(__dirname, 'icons', 'icon-512.png'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'electron-preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: false
        }
    });

    // السماح بأخذ لقطات الشاشة
    try {
        mainWindow.setContentProtection(false);
    } catch (e) {}

    // إزالة القوائم الافتراضية
    Menu.setApplicationMenu(null);

    // تحميل صفحة البداية - نفس صفحة موقع الويب الرئيسية (index.html)
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // فتح الروابط الخارجية في المتصفح الافتراضي
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    // منع زر الفحص بالماوس في وضع الإنتاج
    mainWindow.webContents.on('context-menu', (e) => {
        if (!isDev) e.preventDefault();
    });

    // منع فتح أدوات المطورين نهائياً في تطبيق الكمبيوتر
    mainWindow.webContents.on('devtools-opened', () => {
        if (!isDev) {
            mainWindow.webContents.closeDevTools();
        }
    });

    // الانتقال بعد 3 ثوانٍ من شاشة الإقلاع إلى نافذة المنصة
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
            splashWindow = null;
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
        }
    }, 3000);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ─── تسجيل معالجات تحكم النوافذ (IPC Handlers) ───
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize-toggle', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-check-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('get-app-info', () => {
    return {
        name: 'ELKHETA Desktop',
        version: '2.0.0',
        platform: process.platform,
        arch: process.arch
    };
});

// ─── دورة حياة التطبيق (App Lifecycle) ───
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        createSplashScreen();
        createMainWindow();

        // اختصار لوحة المفاتيح لإعادة التحميل
        globalShortcut.register('CommandOrControl+R', () => {
            if (mainWindow) mainWindow.reload();
        });

        // اختصار ملء الشاشة F11
        globalShortcut.register('F11', () => {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
        });

        if (isDev) {
            globalShortcut.register('CommandOrControl+Shift+I', () => {
                if (mainWindow) mainWindow.webContents.toggleDevTools();
            });
        }
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });
}
