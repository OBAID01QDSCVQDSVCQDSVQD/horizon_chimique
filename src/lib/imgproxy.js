export function getImageUrl(fileName, width = 800, height = 600) {
    if (!fileName) return '';
    
    if (fileName.startsWith('http')) return fileName;

    const bucket = process.env.MINIO_BUCKET || "horizon-chimique";
    const endpoint = process.env.MINIO_ENDPOINT || "storage.sdkbatiment.com";
    const imgproxyUrl = process.env.IMGPROXY_URL || "https://imgproxy.sdkbatiment.com";
    
    // الرابط الأصلي للصورة في MinIO
    const sourceUrl = `https://${endpoint}/${bucket}/${fileName}`;
    
    // نرجع الرابط مع خيار الـ resize والـ watermark والتحويل لـ webp
    // wm:0.3:ce:0:0:0.2  (شفافية 0.3، مركز ce، إزاحة 0، حجم 20%)
    return `${imgproxyUrl}/insecure/rs:fit:${width}:${height}/q:80/wm:0.3:ce:0:0:0.2/plain/${sourceUrl}@webp`;
}
