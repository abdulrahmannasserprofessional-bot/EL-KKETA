        </main>
    </div>

    <!-- JavaScript الأساسي والتفاعلي -->
    <script>
        // فتح وإغلاق القائمة الجانبية في الهواتف
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('adminSidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });

            // إغلاق القائمة عند النقر خارجها
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                }
            });
        }

        // دالة موحدة لعرض رسائل التنبيه والنجاح
        function showNotification(type, title, message) {
            Swal.fire({
                icon: type,
                title: title,
                text: message,
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#2563EB',
                customClass: {
                    popup: 'cairo-font'
                }
            });
        }
    </script>
</body>
</html>
