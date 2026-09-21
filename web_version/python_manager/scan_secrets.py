#!/usr/bin/env python3
"""
ELKHETA Vibe Coding Secret & Vulnerability Scanner
===================================================
فاحص الأمان التلقائي لحماية الـ Vibe Coding:
يمسح الكود والمستندات قبل أي نشر أو Commit للتأكد من خلو المشروع تماماً من الأسرار المسربة.
"""

import os
import re
import sys

# أنماط المفاتيح والأسرار المشبوهة
SECRET_PATTERNS = [
    (r'(?i)(api_key|apikey|secret|password|passwd|pwd)\s*[:=]\s*["\'][A-Za-z0-9_\-]{16,}["\']', "مفتاح سرية أو كلمة مرور مكشوفة"),
    (r'AIzaSy[A-Za-z0-9_\-]{33}', "Firebase Web API Key مسرب"),
    (r'sqp_[a-f0-9]{40}', "Stripe Secret Key مسرب"),
    (r'ghp_[A-Za-z0-9]{36}', "GitHub Personal Access Token مسرب"),
    (r'sk-[A-Za-z0-9]{32,}', "OpenAI / Anthropic Secret Key مسرب"),
    (r'mysql://[^:]+:[^@]+@', "رابط قاعدة بيانات يحتوي على كلمة مرور مكشوفة"),
]

# الملفات والمجلدات المستثناة من الفحص
EXCLUDE_DIRS = {'.git', 'node_modules', '.firebase', 'backups', 'scratch', 'dist'}
EXCLUDE_FILES = {'package-lock.json', '.env.example', 'scan_secrets.py'}

def scan_file(filepath):
    findings = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            for line_idx, line in enumerate(lines, 1):
                # التغاضي عن التعليقات أو التنبيهات المقبولة
                if 'FIXME_SAFE' in line or 'IGNORE_SECRET' in line:
                    continue
                for pattern, desc in SECRET_PATTERNS:
                    if re.search(pattern, line):
                        # استثناء apiKey في firebase-config.js و firebase-messaging-sw.js المقبول للواجهة العامة
                        if ('firebase-config.js' in filepath or 'firebase-messaging-sw.js' in filepath) and 'apiKey' in line:
                            continue
                        findings.append((line_idx, desc, line.strip()))
    except Exception as e:
        pass
    return findings

def run_scan(root_dir):
    print("==================================================")
    print("🛡️ ELKHETA Vibe Coding Security Scanner")
    print("==================================================")
    print(f"🔍 Jari Scanning directory: {root_dir}\n")
    
    total_files = 0
    issues_found = 0
    
    for root, dirs, files in os.walk(root_dir):
        # استثناء المجلدات
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if file in EXCLUDE_FILES or file.endswith('.png') or file.endswith('.jpg') or file.endswith('.ico'):
                continue
            
            filepath = os.path.join(root, file)
            total_files += 1
            findings = scan_file(filepath)
            
            if findings:
                issues_found += len(findings)
                rel_path = os.path.relpath(filepath, root_dir)
                print(f"❌ [ALERT] {rel_path}:")
                for line_num, desc, content in findings:
                    print(f"   └─ Line {line_num}: {desc} -> {content[:60]}...")
    
    print("\n--------------------------------------------------")
    print(f"📊 Scan Summary: {total_files} files inspected.")
    if issues_found == 0:
        print("✅ SUCCESS: No leaked secrets or hardcoded credentials found!")
        print("🛡️ Your Vibe Coding workspace is CLEAN and SECURE.")
        print("--------------------------------------------------\n")
        return True
    else:
        print(f"⚠️ WARNING: Found {issues_found} potential security issue(s)!")
        print("--------------------------------------------------\n")
        return False

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    project_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    success = run_scan(project_root)
    if not success:
        sys.exit(1)
