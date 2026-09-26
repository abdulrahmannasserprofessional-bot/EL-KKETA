/**
 * ELKHETA Admin OS - Unified Layout & Navigation Injector (v3.0)
 * Automatically builds Topbar & Sidebar for all internal admin pages
 */

(function() {
  // ─── Universal Admin Authentication Guard ───
  const isAuth = sessionStorage.getItem('isAdmin') === 'true' || sessionStorage.getItem('elkheta_admin_authenticated') === 'true';
  const currentPath = window.location.pathname.split('/').pop().toLowerCase() || 'admin-panel.html';

  if (!isAuth && currentPath !== 'admin-gate.html') {
    document.documentElement.style.display = 'none';
    const returnUrl = encodeURIComponent(currentPath + window.location.search);
    window.location.replace('admin-gate.html?returnUrl=' + returnUrl);
    return;
  }

  // ── Block universal student mobile navigation & footer ──
  window.__ELKHETA_ADMIN_OS__ = true;
  window.__NO_MOBILE_NAV__ = true;
  window.__NO_TICKER__ = true;

  function buildSidebarHTML() {
    const items = [
      { type: 'header', text: '📚 المحتوى والتعليم' },
      { href: 'admin-students.html', icon: 'fa-users', text: 'إدارة الطلاب', badgeId: 'nb-students', badgeCls: 'gold' },
      { href: 'admin-courses.html', icon: 'fa-book-bookmark', text: 'المواد والكورسات' },
      { href: 'admin-classes.html', icon: 'fa-chalkboard-user', text: 'الفصول والمراحل' },
      { href: 'admin-lessons.html', icon: 'fa-clapperboard', text: 'المحاضرات والفيديوهات' },
      { href: 'admin-notes-builder.html', icon: 'fa-note-sticky', text: 'النوتس والمذكرات' },
      { href: 'admin-courses.html#weeklyScheduleAdminSection', icon: 'fa-calendar-week', text: 'الجدول الأسبوعي' },

      { type: 'header', text: '📝 الامتحانات والنتائج' },
      { href: 'admin-exams.html', icon: 'fa-file-pen', text: 'إدارة الامتحانات', badgeId: 'nb-exams', badgeCls: 'blue' },
      { href: 'admin-results.html', icon: 'fa-square-poll-vertical', text: 'سجل النتائج والدرجات' },
      { href: 'admin-essay.html', icon: 'fa-pen-to-square', text: 'تصحيح المقالي والدرجات ✍️', badgeId: 'nb-essay', badgeCls: 'purple' },
      { href: 'admin-mistakes.html', icon: 'fa-triangle-exclamation', text: 'أخطاء الطلاب' },
      { href: 'admin-upload-exam-backup.html', icon: 'fa-upload', text: 'رفع نسخة امتحان' },

      { type: 'header', text: '💳 الاشتراكات والمالية' },
      { href: 'admin-codes.html', icon: 'fa-key', text: 'أكواد التفعيل', badgeId: 'nb-codes', badgeCls: 'green' },
      { href: 'admin-otps.html', icon: 'fa-shield-keyhole', text: 'رموز OTP' },

      { type: 'header', text: '💬 التواصل والمجتمع' },
      { href: 'admin-chat.html', icon: 'fa-headset', text: 'الدعم والشات المباشر', badgeId: 'nb-chat', badgeCls: 'green' },
      { href: 'admin-notifications.html', icon: 'fa-bullhorn', text: 'الإشعارات والرسائل' },
      { href: 'admin-community.html', icon: 'fa-users-rectangle', text: 'المجتمع والمناقشات' },
      { href: 'leaderboard.html', icon: 'fa-trophy', text: 'لوحة الشرف' },

      { type: 'header', text: '📊 التقارير والذكاء' },
      { href: 'ai-report.html', icon: 'fa-chart-pie', text: 'تقارير الـ AI الشاملة' },

      { type: 'header', text: '🔧 النظام والأمان' },
      { href: 'admin-system.html', icon: 'fa-server', text: 'System Command Center' },
      { href: 'admin-radar.html', icon: 'fa-bolt', text: 'رادار النشاط المباشر ⚡' },
      { href: 'admin-security.html', icon: 'fa-shield-halved', text: 'مركز الأمان والرقابة' },
      { href: 'admin-config.html', icon: 'fa-gear', text: 'الإعدادات العامة' },
      { href: 'admin-maintenance.html', icon: 'fa-screwdriver-wrench', text: 'وضع الصيانة' },
    ];

    let html = `
      <div class="sidebar-inner">
    `;

    items.forEach(it => {
      if (it.type === 'header') {
        html += `<div class="nav-section-hd">${it.text}</div>`;
      } else {
        const isActive = currentPath === it.href.toLowerCase();
        html += `
          <a href="${it.href}" class="nav-item ${isActive ? 'active' : ''}">
            <i class="fa-solid ${it.icon}"></i>
            <span>${it.text}</span>
            ${it.badgeId ? `<span class="nav-badge ${it.badgeCls || 'gold'}" id="${it.badgeId}" style="display:none"></span>` : ''}
          </a>
        `;
      }
    });

    html += `
      </div>
      <div class="sidebar-footer-wrap">
        <button class="btn-logout" onclick="adminLogout()">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    `;

    return html;
  }

  function initLayout() {
    // 1. Remove unwanted injected elements
    const unwanted = [
      '#universalMobileDock', '.universal-mobile-dock',
      '#mobileDrawerBackdrop', '.mobile-drawer-backdrop',
      '#mobileAdminDrawer', '.mobile-injected-sidebar',
      '#universalTopTicker', '.elkheta-announcement-toast'
    ];
    unwanted.forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));

    // 2. Build or wrap Sidebar if existing element has id "sidebar"
    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl && !sidebarEl.classList.contains('os-built')) {
      sidebarEl.className = 'os-sidebar';
      sidebarEl.innerHTML = buildSidebarHTML();
      sidebarEl.classList.add('os-built');

      // Auto-inject backdrop if missing
      if (!document.getElementById('sidebarBackdrop') && !document.getElementById('sidebarOverlay')) {
        const bd = document.createElement('div');
        bd.id = 'sidebarBackdrop';
        bd.className = 'sidebar-backdrop';
        bd.onclick = () => toggleSidebar(false);
        sidebarEl.parentNode.insertBefore(bd, sidebarEl);
      }

      // Auto-close sidebar on mobile when nav link is clicked
      sidebarEl.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            toggleSidebar(false);
          }
        });
      });
    }

    // 2.5 Ensure Topbar has mobile hamburger toggle button
    const topbar = document.querySelector('.os-topbar');
    if (topbar && !topbar.querySelector('.mob-menu-btn')) {
      const mobBtn = document.createElement('button');
      mobBtn.className = 'btn-icon mob-menu-btn';
      mobBtn.title = 'القائمة';
      mobBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      mobBtn.onclick = () => window.toggleSidebar();
      const brand = topbar.querySelector('.os-brand');
      if (brand) {
        brand.insertBefore(mobBtn, brand.firstChild);
      } else {
        topbar.insertBefore(mobBtn, topbar.firstChild);
      }
    }

    // 2.6 Auto-wrap bare tables with touch-scrollable container
    document.querySelectorAll('table').forEach(tbl => {
      const parent = tbl.parentElement;
      if (parent && !parent.classList.contains('table-wrap') && !parent.classList.contains('table-container') && parent.style.overflowX !== 'auto') {
        const wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        wrap.style.width = '100%';
        wrap.style.maxWidth = '100%';
        wrap.style.overflowX = 'auto';
        wrap.style.webkitOverflowScrolling = 'touch';
        parent.insertBefore(wrap, tbl);
        wrap.appendChild(tbl);
      }
    });

    // 3. Update clock
    function updateClock() {
      const now = new Date();
      const str = now.toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false});
      document.querySelectorAll('.clock-box, #clock').forEach(el => el.textContent = str);
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 4. Update sidebar badge counters from cached data
    try {
      const cached = localStorage.getItem('cached_admin_students');
      if (cached) {
        const list = JSON.parse(cached);
        const nb = document.getElementById('nb-students');
        if (nb && list.length) {
          nb.textContent = list.length;
          nb.style.display = 'inline-flex';
        }
      }
    } catch(e) {}
  }

  // Toggle sidebar function
  window.toggleSidebar = function(force) {
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebarBackdrop') || document.getElementById('sidebarOverlay');
    if (!sb) return;
    const isOpen = force !== undefined ? force : !sb.classList.contains('open');
    sb.classList.toggle('open', isOpen);
    if (bd) {
      bd.classList.toggle('show', isOpen);
      bd.classList.toggle('active', isOpen);
      bd.style.display = isOpen ? 'block' : 'none';
    }
  };

  // Admin Logout
  window.adminLogout = function() {
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة الإدارة؟')) {
      sessionStorage.removeItem('isAdmin');
      sessionStorage.removeItem('elkheta_admin_authenticated');
      sessionStorage.removeItem('adminRole');
      sessionStorage.removeItem('adminName');
      sessionStorage.removeItem('adminLoginTime');
      window.location.replace('admin-gate.html');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }

  // Late cleanup
  setTimeout(initLayout, 500);
  setTimeout(initLayout, 1500);
})();
