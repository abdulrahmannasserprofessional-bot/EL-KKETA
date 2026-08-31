const fs = require('fs');
const path = require('path');

let cachedHtml = '';

function getAdminHtml() {
    if (cachedHtml) return cachedHtml;
    try {
        const p = path.join(__dirname, '../public/admin.html');
        if (fs.existsSync(p)) {
            cachedHtml = fs.readFileSync(p, 'utf8');
            return cachedHtml;
        }
    } catch(e) {}

    // Fallback inline HTML
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم منصة الخطة - MySQL Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Cairo',sans-serif; }
        body { background:#F8FAFC; color:#0F172A; min-height:100vh; display:flex; }
        .sidebar { width:260px; background:#FFF; border-left:1px solid #E2E8F0; height:100vh; position:fixed; right:0; top:0; padding:20px 15px; }
        .main { margin-right:260px; flex:1; padding:30px; }
        .card { background:#FFF; border:1px solid #E2E8F0; border-radius:16px; padding:20px; margin-bottom:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.02); }
        .btn { padding:10px 20px; border-radius:10px; font-weight:700; cursor:pointer; border:none; background:#2563EB; color:#FFF; }
        .badge { padding:4px 10px; border-radius:8px; font-size:12px; font-weight:700; background:#DCFCE7; color:#15803D; }
        table { width:100%; border-collapse:collapse; text-align:right; margin-top:10px; }
        th, td { padding:12px 16px; border-bottom:1px solid #E2E8F0; font-size:14px; }
        th { background:#F8FAFC; color:#64748B; font-weight:700; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="font-size:18px; font-weight:800; color:#2563EB; margin-bottom:20px;"><i class="fa-solid fa-graduation-cap"></i> منصة الخطة</h2>
        <div style="font-size:13px; font-weight:700; color:#64748B; margin-bottom:10px;">إدارة السيرفر و MySQL</div>
        <div style="margin-top:20px;"><span class="badge">قاعدة البيانات: متصلة ⚡</span></div>
    </div>
    <div class="main">
        <div class="card">
            <h2 style="font-size:20px; font-weight:800; margin-bottom:6px;">لوحة تحكم وإدارة المنصة</h2>
            <p style="font-size:13px; color:#64748B;">السيرفر متصل مباشرة بقاعدة بيانات TiDB MySQL السحابية</p>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:20px;">
            <div class="card" style="margin:0;"><h3 id="sCount" style="font-size:24px; font-weight:900; color:#2563EB;">0</h3><p style="font-size:12px; color:#64748B;">إجمالي الطلاب</p></div>
            <div class="card" style="margin:0;"><h3 id="lCount" style="font-size:24px; font-weight:900; color:#10B981;">0</h3><p style="font-size:12px; color:#64748B;">المحاضرات</p></div>
            <div class="card" style="margin:0;"><h3 id="cCount" style="font-size:24px; font-weight:900; color:#F59E0B;">0</h3><p style="font-size:12px; color:#64748B;">الأكواد المتاحة</p></div>
        </div>
        <div class="card">
            <h3 style="font-size:16px; font-weight:800; margin-bottom:15px;"><i class="fa-solid fa-users"></i> أحدث الطلاب المسجلين</h3>
            <table>
                <thead><tr><th>كود الطالب</th><th>الاسم</th><th>الهاتف</th><th>الصف</th><th>الرصيد</th></tr></thead>
                <tbody id="stBody"><tr><td colspan="5" style="text-align:center; color:#94A3B8;">جاري التحميل...</td></tr></tbody>
            </table>
        </div>
    </div>
    <script>
        fetch('/api/students').then(r=>r.json()).then(d=>{
            if(d.success) {
                document.getElementById('sCount').textContent = d.count;
                const b = document.getElementById('stBody');
                b.innerHTML = '';
                if(d.students.length === 0) {
                    b.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94A3B8;">لا يوجد طلاب مسجلون حالياً</td></tr>';
                    return;
                }
                d.students.forEach(s => {
                    b.innerHTML += \`<tr>
                        <td style="font-weight:800; font-family:monospace; color:#4F46E5;">\${s.student_code}</td>
                        <td style="font-weight:700;">\${s.full_name}</td>
                        <td dir="ltr" style="text-align:right;">\${s.phone || '—'}</td>
                        <td>\${s.grade}</td>
                        <td style="font-weight:800; color:#10B981;">\${s.wallet_balance} ج.م</td>
                    </tr>\`;
                });
            }
        });
        fetch('/api/lectures').then(r=>r.json()).then(d=>{ if(d.success) document.getElementById('lCount').textContent = d.count; });
        fetch('/api/codes').then(r=>r.json()).then(d=>{ if(d.success) document.getElementById('cCount').textContent = d.codes.filter(c=>!c.is_used).length; });
    </script>
</body>
</html>`;
}

module.exports = { getAdminHtml };
