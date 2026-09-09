/**
 * security-validator.js — ELKHETA Security Layer
 * ================================================
 * يوفر هذا الملف:
 * 1. Input Sanitization — تنقية المدخلات من XSS و SQL Injection
 * 2. Rate Limiting — حد أقصى للطلبات لمنع الاستنزاف المالي (Denial of Wallet)
 * 3. Prompt Injection Detection — كشف محاولات خداع نماذج الذكاء الاصطناعي
 * 4. Admin Login Protection — حماية تسجيل دخول الأدمن من Brute Force
 */

// ============================================================
// 1. INPUT SANITIZATION — تنقية المدخلات
// ============================================================
const SecurityValidator = {

    /**
     * تنقية النص من هجمات XSS
     * يحوّل الرموز الخطرة إلى HTML entities آمنة
     */
    sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .replace(/`/g, '&#x60;');
    },

    /**
     * تنقية النص للاستخدام العام (بدون HTML)
     * يزيل الأحرف الخطرة مع الإبقاء على اللغة العربية والأرقام والمسافات
     */
    sanitizeText(input, maxLength = 500) {
        if (typeof input !== 'string') return '';
        return input
            .trim()
            .slice(0, maxLength)
            .replace(/[<>'"`;\\]/g, '');
    },

    /**
     * التحقق من صحة الإيميل
     */
    isValidEmail(email) {
        const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    },

    /**
     * التحقق من صحة رقم الهاتف المصري
     */
    isValidEgyptianPhone(phone) {
        const cleaned = String(phone).replace(/\s/g, '');
        return /^(01[0-2,5]\d{8})$/.test(cleaned);
    },

    /**
     * التحقق من صحة كود الطالب (أرقام فقط، 4-12 خانة)
     */
    isValidStudentCode(code) {
        return /^[a-zA-Z0-9\u0600-\u06FF]{4,20}$/.test(String(code).trim());
    },

    // ============================================================
    // 2. PROMPT INJECTION DETECTION — كشف هجمات الـ Prompt Injection
    // ============================================================

    /** أنماط هجمات Prompt Injection الشائعة */
    _promptInjectionPatterns: [
        /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|context)/i,
        /forget\s+(everything|all|previous)/i,
        /you\s+are\s+now\s+a/i,
        /act\s+as\s+(if\s+you\s+are|a\s+different)/i,
        /system\s*:\s*you\s+are/i,
        /\[SYSTEM\]/i,
        /\[INST\]/i,
        /###\s*(System|Assistant|Human)/i,
        /جاهل\s+التعليمات/,
        /تجاهل\s+(كل|التعليمات|السابق)/,
        /أنت\s+الآن\s+(ذكاء|نموذج|مساعد)/,
        /دورك\s+الجديد/,
        /تصرف\s+كأنك/,
    ],

    /**
     * فحص النص من محاولات Prompt Injection
     * @returns {boolean} true إذا كانت المدخلات خطرة
     */
    detectPromptInjection(input) {
        if (typeof input !== 'string') return false;
        return this._promptInjectionPatterns.some(pattern => pattern.test(input));
    },

    /**
     * تنقية مدخلات المستخدم قبل إرسالها لنموذج الذكاء الاصطناعي
     * @returns {string|null} النص المنقّى، أو null إذا كانت المدخلات مشبوهة
     */
    sanitizeForAI(input, maxLength = 2000) {
        if (typeof input !== 'string') return null;
        const trimmed = input.trim().slice(0, maxLength);

        if (this.detectPromptInjection(trimmed)) {
            console.warn('[SECURITY] Prompt injection attempt detected:', trimmed.slice(0, 100));
            return null;
        }

        return trimmed;
    },

    // ============================================================
    // 3. RATE LIMITER — حد أقصى للطلبات (Client-side)
    // ============================================================

    _rateLimitStore: {},

    /**
     * فحص Rate Limit لعملية معينة
     * @param {string} key — معرّف العملية (مثل 'login', 'submit_exam', 'ai_request')
     * @param {number} maxRequests — الحد الأقصى من الطلبات
     * @param {number} windowMs — النافزة الزمنية بالمللي ثانية
     * @returns {boolean} true إذا كان الطلب مسموحاً به
     */
    checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
        const now = Date.now();
        if (!this._rateLimitStore[key]) {
            this._rateLimitStore[key] = { count: 0, windowStart: now };
        }

        const entry = this._rateLimitStore[key];

        // تجديد النافذة الزمنية إذا انتهت
        if (now - entry.windowStart > windowMs) {
            entry.count = 0;
            entry.windowStart = now;
        }

        entry.count++;

        if (entry.count > maxRequests) {
            const remainingSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
            console.warn(`[RATE LIMIT] "${key}" exceeded ${maxRequests} requests. Retry in ${remainingSec}s`);
            return false;
        }

        return true;
    },

    /**
     * الوقت المتبقي حتى انتهاء نافذة Rate Limit (بالثواني)
     */
    getRateLimitRemainingSeconds(key, windowMs = 60000) {
        const entry = this._rateLimitStore[key];
        if (!entry) return 0;
        const elapsed = Date.now() - entry.windowStart;
        return Math.max(0, Math.ceil((windowMs - elapsed) / 1000));
    },

    // ============================================================
    // 4. ADMIN LOGIN BRUTE FORCE PROTECTION
    // ============================================================

    _loginAttempts: {},

    /**
     * تسجيل محاولة تسجيل دخول فاشلة
     * @param {string} identifier — IP أو معرّف المستخدم
     * @returns {object} { blocked: bool, attemptsLeft: number, lockoutSeconds: number }
     */
    recordFailedLogin(identifier = 'default') {
        const MAX_ATTEMPTS = 5;
        const LOCKOUT_MS = 15 * 60 * 1000; // 15 دقيقة
        const now = Date.now();

        if (!this._loginAttempts[identifier]) {
            this._loginAttempts[identifier] = { count: 0, lockedUntil: 0 };
        }

        const entry = this._loginAttempts[identifier];

        // إذا كان مقفلاً
        if (entry.lockedUntil > now) {
            return {
                blocked: true,
                attemptsLeft: 0,
                lockoutSeconds: Math.ceil((entry.lockedUntil - now) / 1000)
            };
        }

        entry.count++;

        if (entry.count >= MAX_ATTEMPTS) {
            entry.lockedUntil = now + LOCKOUT_MS;
            entry.count = 0;
            console.warn(`[SECURITY] Login locked for "${identifier}" for 15 minutes`);
            return { blocked: true, attemptsLeft: 0, lockoutSeconds: LOCKOUT_MS / 1000 };
        }

        return {
            blocked: false,
            attemptsLeft: MAX_ATTEMPTS - entry.count,
            lockoutSeconds: 0
        };
    },

    /**
     * التحقق مما إذا كان المستخدم مقفلاً حالياً
     */
    isLoginBlocked(identifier = 'default') {
        const entry = this._loginAttempts[identifier];
        if (!entry) return { blocked: false, lockoutSeconds: 0 };
        if (entry.lockedUntil > Date.now()) {
            return {
                blocked: true,
                lockoutSeconds: Math.ceil((entry.lockedUntil - Date.now()) / 1000)
            };
        }
        return { blocked: false, lockoutSeconds: 0 };
    },

    /**
     * مسح سجل المحاولات بعد تسجيل دخول ناجح
     */
    clearLoginAttempts(identifier = 'default') {
        delete this._loginAttempts[identifier];
    },

    // ============================================================
    // 5. TOKEN / MAX COST GUARD — حماية من Denial of Wallet
    // ============================================================

    /**
     * حساب عدد التوكنز التقريبي لنص معين
     * (تقريب: 4 أحرف إنجليزية ≈ توكن، حرف عربي ≈ 1-2 توكن)
     */
    estimateTokens(text) {
        if (typeof text !== 'string') return 0;
        const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
        const otherChars = text.length - arabicChars;
        return Math.ceil(arabicChars * 1.5 + otherChars / 4);
    },

    /**
     * التحقق من أن الطلب لن يتجاوز الحد الأقصى للتوكنز
     * @param {string} text — النص المراد إرساله
     * @param {number} maxTokens — الحد الأقصى المسموح
     * @returns {boolean}
     */
    isWithinTokenLimit(text, maxTokens = 500) {
        return this.estimateTokens(text) <= maxTokens;
    }
};

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
    window.SecurityValidator = SecurityValidator;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityValidator;
}
