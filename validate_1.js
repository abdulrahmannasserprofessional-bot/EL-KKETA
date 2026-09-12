
        function openPrivacyModal() {
            document.getElementById('privacyModal').classList.add('active');
            checkPrivacyScroll();
        }
        function checkPrivacyScroll() {
            const body = document.getElementById('privacyBody');
            const btn = document.getElementById('btnAgree');
            // If scrolled to bottom or content is small
            if (body.scrollHeight - body.scrollTop <= body.clientHeight + 10) {
                btn.disabled = false;
            }
        }
        function acceptPrivacy() {
            document.getElementById('privacyModal').classList.remove('active');
            const chk = document.getElementById('privacyCheck');
            chk.disabled = false;
            chk.checked = true;
        }
    