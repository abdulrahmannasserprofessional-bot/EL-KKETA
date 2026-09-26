/**
 * Toast Notification Utility for ELKHETA Educational Platform
 */

function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span style="flex: 1;">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 350);
    }, duration);
}

// Global Online/Offline Network Status Handlers
window.addEventListener('offline', () => {
    showToast('⚠️ انقطع الاتصال بالإنترنت. يمكنك متابعة الامتحانات المحملة أوفلاين', 'warning', 5000);
});

window.addEventListener('online', () => {
    showToast('🟢 تمت استعادة الاتصال بالإنترنت بنجاح!', 'success', 3500);
});
