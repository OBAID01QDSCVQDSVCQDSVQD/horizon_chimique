/**
 * جنريتور روابط الصور المضغوطة عبر imgproxy
 * @param {string} fileName - مسار الملف في MinIO الكامل (مثلاً: uploads/photo.jpg)
 * @param {number} width - العرض المطلوب
 * @param {number} height - الطول المطلوب
 */
export function getImageUrl(fileName, width = 800, height = 600) {
    if (!fileName) return '';
    
    // إذا كانت الصورة خارجية (كلاوديناري قديم مثلاً) لا نلمسها
    if (fileName.startsWith('http')) return fileName;

    const bucket = process.env.MINIO_BUCKET || "horizon-chimique";
    const endpoint = process.env.MINIO_ENDPOINT || "storage.sdkbatiment.com";
    const imgproxyUrl = "https://imgproxy.sdkbatiment.com";
    
    // الرابط الأصلي الذي سيسحب منه imgproxy
    const sourceUrl = `https://${endpoint}/${bucket}/${fileName}`;
    
    // تشفير الرابط بـ Base64 لضمان عدم حدوث مشاكل مع الشرطات (سواء في plain أو غيره)
    const b64Url = Buffer.from(sourceUrl).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    
    // نرجع الرابط مع خيار الـ resize والتحويل لـ webp والـ fit
    // الترتيب: /insecure/خيارات/المصدر.webp
    return `${imgproxyUrl}/insecure/rs:fit:${width}:${height}/q:80/${b64Url}.webp`;
}
