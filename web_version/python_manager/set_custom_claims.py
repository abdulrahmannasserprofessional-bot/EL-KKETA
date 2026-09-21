#!/usr/bin/env python3
"""
ELKHETA Custom Claims & RBAC Manager
====================================
يساعد هذا السكربت على تعيين الأدوار والصلاحيات المشفرة (Custom Claims)
لكافة مستخدمي المنصة (Super Admin, Supervisor, Support, Student).
"""

import os
import sys
import json
import urllib.request

def set_custom_claims_payload(uid, role, extra_permissions=None):
    """
    تكوين حمولة الصلاحيات المخصصة
    """
    valid_roles = {'super_admin', 'admin', 'supervisor', 'support', 'content_manager', 'student'}
    if role not in valid_roles:
        print(f"[ERROR] Invalid role: {role}. Must be one of {valid_roles}")
        return None

    claims = {
        "role": role,
        "is_admin": role in {'super_admin', 'admin', 'supervisor'},
        "updatedAt": int(os.environ.get("TIMESTAMP", 0)) or 1758300000
    }

    if extra_permissions:
        claims["permissions"] = extra_permissions

    print(f"✅ Configured Custom Claims for UID [{uid}]: Role = '{role}'")
    return claims

def main():
    print("==================================================")
    print("🛡️ ELKHETA Custom Claims & Role-Based Access Control")
    print("==================================================")

    if len(sys.argv) < 3:
        print("Usage: python set_custom_claims.py <UID> <ROLE>")
        print("Roles: super_admin | admin | supervisor | support | student")
        print("\nExample:")
        print("  python set_custom_claims.py UID_ADMIN_123 super_admin")
        return

    uid = sys.argv[1]
    role = sys.argv[2]
    claims = set_custom_claims_payload(uid, role)

    if claims:
        print("\nGenerated Token Claims Payload:")
        print(json.dumps(claims, indent=2))
        print("\n[NOTE] Apply this payload via Firebase Admin SDK or Auth REST Endpoint.")

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main()
