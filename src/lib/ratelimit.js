import redis from './redis';

/**
 * دالة لتحديد عدد الطلبات (Rate Limiting)
 * @param {string} identifier - المعرف (غالباً عنوان الـ IP)
 * @param {number} limit - أقصى عدد طلبات مسموح به
 * @param {number} windowInSeconds - المدة الزمنية بالثواني
 * @returns {Promise<{success: boolean, limit: number, remaining: number}>}
 */
export async function rateLimit(identifier, limit = 10, windowInSeconds = 60) {
    if (!redis) {
        // إذا كان الريديس معطلاً، نسمح بالمرور لعدم تعطيل الخدمة (Fail-safe)
        return { success: true, limit, remaining: 1 };
    }

    const key = `rl:${identifier}`;

    try {
        const count = await redis.get(key);
        const currentCount = parseInt(count || '0', 10);

        if (currentCount >= limit) {
            return { success: false, limit, remaining: 0 };
        }

        // زيادة العداد
        const newCount = await redis.incr(key);
        
        // إذا كان الطلب الأول، نضبط وقت انتهاء الصلاحية
        if (newCount === 1) {
            await redis.expire(key, windowInSeconds);
        }

        return { success: true, limit, remaining: limit - newCount };
    } catch (error) {
        console.error('RateLimit Error:', error);
        return { success: true, limit, remaining: 1 };
    }
}
