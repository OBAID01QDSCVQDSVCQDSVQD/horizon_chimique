import Redis from 'ioredis';

const getRedisUrl = () => {
    return process.env.REDIS_URL || 'redis://localhost:6379';
};

let redis = null;

if (typeof window === 'undefined') {
    try {
        redis = new Redis(getRedisUrl(), {
            maxRetriesPerRequest: 1, // تقليل المحاولات لعدم تعطيل الموقع
            connectTimeout: 5000,    // 5 ثواني كحد أقصى للاتصال
            retryStrategy: (times) => {
                if (times > 3) return null; // توقف بعد 3 محاولات فاشلة
                return Math.min(times * 200, 1000);
            }
        });

        redis.on('error', (err) => {
            // صامت: لا نريد طباعة الأخطاء في كل مكان لعدم إزعاج المستخدم
            // console.warn('Redis connection issue, skipping cache...');
        });

    } catch (e) {
        console.error('Redis Initialization Error:', e);
        redis = null;
    }
}

export default redis;
