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
    
    // رابط اللوجو (الذي سنرفعه للباكت)
    const watermarkUrl = `https://${endpoint}/${bucket}/logo.png`;
    const b64Watermark = Buffer.from(watermarkUrl).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    // نرجع الرابط مع خيار الـ resize والـ watermark والتحويل لـ webp
    // wm:0.3:ce:0:0:0.2  (شفافية 0.3، مركز ce، إزاحة 0، حجم 20%)
    return `${imgproxyUrl}/insecure/rs:fit:${width}:${height}/q:80/wm:0.3:ce:0:0:0.2/plain/${sourceUrl}@webp`;
}
