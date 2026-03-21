import admin from 'firebase-admin';

const initAdmin = () => {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        console.error('Firebase Admin missing env variables:', {
            projectId: !!projectId,
            clientEmail: !!clientEmail,
            privateKey: !!privateKey
        });
        // In some environments, initializeApp without params might work if google-application-credentials is set
        return admin.initializeApp();
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
        return admin.app(); // Return existing if failed
    }
};

initAdmin();

export default admin;
