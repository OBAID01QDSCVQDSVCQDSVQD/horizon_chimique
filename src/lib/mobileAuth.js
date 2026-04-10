import jwt from 'jsonwebtoken';

export async function getMobileSession(req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback_secret');
            return { user: decoded };
        } catch(e) {
            return null;
        }
    }
    return null;
}
