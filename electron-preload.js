/**
 * ⚡ ELKHETA Desktop Preload Bridge
 * جسر التواصل الآمن بين صفحات الويب وواجهة نظام تشغيل Windows
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApi', {
    isDesktop: true,
    minimize: () => ipcRenderer.send('window-minimize'),
    maximizeToggle: () => ipcRenderer.send('window-maximize-toggle'),
    close: () => ipcRenderer.send('window-close'),
    checkMaximized: () => ipcRenderer.invoke('window-check-maximized'),
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    onMaximizedChange: (callback) => {
        ipcRenderer.on('window-is-maximized', (event, isMax) => callback(isMax));
    }
});

// تهيئة فورية لبيئة سطح المكتب
window.addEventListener('DOMContentLoaded', () => {
    try {
        if (!localStorage.getItem('user')) {
            const defaultUser = {
                fullName: 'طالب الخطة (نسخة الكمبيوتر)',
                studentCode: 'DESKTOP_2026',
                phone: '01000000000',
                stage: 'الفرقة الثالثة',
                points: 1250,
                streak: 7,
                level: 5
            };
            localStorage.setItem('user', JSON.stringify(defaultUser));
            localStorage.setItem('elkheta_student', JSON.stringify(defaultUser));
        }
    } catch(e) {}
});
