export function getImageUrl(fileName, width = 800, height = 600) {
    if (!fileName) return '';
    
    if (fileName.startsWith('http')) return fileName;

    const bucket = process.env.MINIO_BUCKET || "horizon-chimique";
    const endpoint = process.env.MINIO_ENDPOINT || "storage.sdkbatiment.com";
    const imgproxyUrl = process.env.IMGPROXY_URL || "https://imgproxy.sdkbatiment.com";
    
    // الرابط الأصلي للصورة في MinIO
    const sourceUrl = `https://${endpoint}/${bucket}/${fileName}`;
    
    // تشفير الرابط بالكامل لضمان عدم حدوث مشاكل مع (/)
    const b64Url = Buffer.from(sourceUrl).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // استدعاء الرابط مع الخيارات
    // wm:0.5:ce (شفافية 0.5، في المركز)
    return `${imgproxyUrl}/insecure/rs:fit:${width}:${height}/q:80/wm:0.5:ce:0:0:0.2/${b64Url}.webp`;
}
