
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
        }
        if (window.caches) {
            caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
        }
    