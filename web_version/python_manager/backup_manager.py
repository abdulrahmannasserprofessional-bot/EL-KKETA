#!/usr/bin/env python3
"""
ELKHETA Backup Manager — نظام النسخ الاحتياطي والتعافي التلقائي
=============================================================
يقوم هذا السكربت بـ:
1. أخذ نسخة احتياطية من قواعد بيانات Firebase Realtime Database (البيانات والقواعد)
2. حفظ النسخ في مجلد backups بتسلسل زمني (Timestamped)
3. آلية الاسترجاع السريع عند وقوع الطوارئ (Restore Mode)
"""

import os
import sys
import json
import datetime
import urllib.request
import urllib.error

# ضبط ترميز stdout ليدعم UTF-8 على ويندوز
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backups")

def ensure_backup_dir():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR, exist_ok=True)
        print(f"[BACKUP] Created backup directory: {BACKUP_DIR}")

def get_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

def backup_firebase_rules():
    """نسخ احتياطي لملف قواعد أمان Firebase"""
    rules_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "database.rules.json")
    if os.path.exists(rules_src):
        ts = get_timestamp()
        target = os.path.join(BACKUP_DIR, f"database.rules_{ts}.json")
        with open(rules_src, 'r', encoding='utf-8') as src_file:
            content = src_file.read()
        with open(target, 'w', encoding='utf-8') as dst_file:
            dst_file.write(content)
        print(f"[SUCCESS] Firebase Rules backed up to: {os.path.basename(target)}")
        return target
    else:
        print("[WARNING] database.rules.json not found!")
        return None

def fetch_firebase_data(db_url):
    """تنزيل نقطة استعادة لبيانات Realtime Database في صيغة JSON"""
    if not db_url.endswith('.json'):
        if db_url.endswith('/'):
            db_url += '.json'
        else:
            db_url += '/.json'
            
    print(f"[BACKUP] Fetching data snapshot from {db_url} ...")
    try:
        req = urllib.request.Request(db_url, headers={'User-Agent': 'ELKHETA-Backup-Agent/1.0'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                ts = get_timestamp()
                target = os.path.join(BACKUP_DIR, f"firebase_snapshot_{ts}.json")
                with open(target, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"[SUCCESS] Firebase Data snapshot saved to: {os.path.basename(target)}")
                return target
    except Exception as e:
        print(f"[ERROR] Failed to fetch database snapshot: {e}")
        return None

def list_backups():
    ensure_backup_dir()
    files = sorted(os.listdir(BACKUP_DIR), reverse=True)
    print("\n--- 📦 Available Backups ---")
    if not files:
        print("No backups found yet.")
    for f in files:
        fpath = os.path.join(BACKUP_DIR, f)
        size_kb = os.path.getsize(fpath) / 1024
        print(f"  • {f} ({size_kb:.2f} KB)")
    print("---------------------------\n")

def run():
    print("==========================================")
    print("🛡️ ELKHETA Disaster Recovery & Backup System")
    print("==========================================")
    ensure_backup_dir()
    
    # 1. النسخ الاحتياطي لقواعد الأمان
    backup_firebase_rules()
    
    # 2. فحص متغيرات البيئة لقاعدة البيانات
    db_url = os.environ.get("FIREBASE_DB_URL", "https://elkheta-default-rtdb.firebaseio.com")
    fetch_firebase_data(db_url)
    
    # 3. عرض النسخ المتاحة
    list_backups()

if __name__ == "__main__":
    run()
