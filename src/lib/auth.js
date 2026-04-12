import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// Normalise le numéro pour comparaison (ex: +216 96 138 290 et +21696138290 -> même clé)
function normalizePhone(p) {
    if (!p || typeof p !== 'string') return '';
    const digits = p.replace(/\D/g, '');
    if (digits.length === 8 && /^[2459]/.test(digits)) return '216' + digits; // 2/4/5/9 (TT, Orange, Ooredoo...) -> 216
    if (digits.startsWith('216')) return digits;
    if (digits.startsWith('0')) return '216' + digits.slice(1);
    return digits;
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email ou Téléphone", type: "text" },
                password: { label: "Mot de passe", type: "password" },
                otp: { label: "OTP Code", type: "text" },
                phone: { label: "Téléphone", type: "text" },
                turnstileToken: { label: "Turnstile Token", type: "text" }
            },
            async authorize(credentials) {
                try {
                    const { identifier, password, otp, phone: phoneCred, turnstileToken } = credentials;

                    // 1. Verify Turnstile if secret is present
                    if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY && turnstileToken) {
                        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
                                response: turnstileToken
                            })
                        });
                        const verifyJson = await verifyRes.json();
                        if (!verifyJson.success) {
                            throw new Error("Échec de la vérification Anti-Bot");
                        }
                    }

                    // Case 4: Local SMS OTP (WinSMS.tn)
                    if (otp && phoneCred) {
                        await dbConnect();
                        const OTP = (await import("@/models/OTP")).default;
                        
                        // Verification
                        const record = await OTP.findOne({ phone: phoneCred, code: otp });
                        if (!record) {
                            throw new Error("Code de vérification incorrect ou expiré");
                        }
                        if (record.expiresAt < new Date()) {
                            throw new Error("Code de vérification expiré");
                        }

                        // OTP is valid, find or create user
                        const phone = phoneCred;
                        const phoneNorm = normalizePhone(phone);

                        let user = await User.findOne({ phone });
                        if (!user && phoneNorm) {
                            const allWithPhone = await User.find({ phone: { $exists: true, $ne: '' } }).select('_id phone');
                            const match = allWithPhone.find(u => normalizePhone(u.phone) === phoneNorm);
                            if (match) user = await User.findById(match._id);
                        }

                        if (!user) {
                            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
                            user = await User.create({
                                name: `Utilisateur ${phone.slice(-4)}`,
                                phone: phone,
                                role: 'client',
                                status: 'approved',
                                password: dummyPassword
                            });
                        }

                        // Delete OTP once used
                        await OTP.deleteMany({ phone });

                        if (user.status === 'rejected') throw new Error("Votre compte a été désactivé.");
                        if (user.role === 'artisan' && user.status === 'pending') throw new Error("Votre compte est en attente de validation.");

                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            image: user.image,
                            companyName: user.companyName,
                        };
                    }

                    // Case 2: Impersonation (Admin se connecte en tant qu'un utilisateur)
                    if (identifier && password && password.startsWith('IMPERSONATE:')) {
                        const token = password.slice('IMPERSONATE:'.length);
                        await dbConnect();
                        const user = await User.findOne({
                            $or: [
                                { email: identifier.toLowerCase?.() || identifier },
                                { phone: identifier }
                            ]
                        }).select('+impersonationToken +impersonationExpires');

                        if (!user || !user.impersonationToken || user.impersonationToken !== token) {
                            throw new Error("Token d'impersonation invalide ou expiré");
                        }
                        if (!user.impersonationExpires || user.impersonationExpires < new Date()) {
                            throw new Error("Token d'impersonation expiré");
                        }

                        // One-time use: clear token
                        user.impersonationToken = null;
                        user.impersonationExpires = null;
                        await user.save();

                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            image: user.image,
                            companyName: user.companyName,
                        };
                    }

                    // Case 3: Normal Email/Phone + Password Login
                    if (!identifier || !password) {
                        throw new Error("Veuillez remplir tous les champs");
                    }

                    // Special Case: Super Admin from ENV (Checked BEFORE DB)
                    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
                    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

                    console.log("Debug Auth - Identifier:", identifier.toLowerCase().trim());
                    console.log("Debug Auth - SuperAdmin Configured:", !!superAdminEmail);

                    if (superAdminEmail && identifier.toLowerCase().trim() === superAdminEmail.toLowerCase().trim()) {
                        if (password === superAdminPassword) {
                            console.log("Super Admin Login Successful");
                            return {
                                id: 'super-admin',
                                name: 'Super Admin',
                                email: superAdminEmail,
                                role: 'admin',
                            };
                        } else {
                            console.warn("Super Admin Login - Password Mismatch");
                        }
                    }

                    // For all other users, connect to DB
                    await dbConnect();

                    const phoneNorm = normalizePhone(identifier);
                    let user = await User.findOne({
                        $or: [
                            { email: identifier.toLowerCase() },
                            { phone: identifier },
                            ...(phoneNorm ? [{ phone: '+' + phoneNorm }, { phone: phoneNorm }] : [])
                        ]
                    });

                    if (!user && phoneNorm) {
                        const allWithPhone = await User.find({ phone: { $exists: true, $ne: '' } }).select('_id phone');
                        const match = allWithPhone.find(u => normalizePhone(u.phone) === phoneNorm);
                        if (match) user = await User.findById(match._id);
                    }

                    if (!user) {
                        throw new Error("Identifiants incorrects");
                    }

                    if (!user.password) {
                        throw new Error("Ce compte utilise la connexion par SMS uniquement.");
                    }

                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) {
                        throw new Error("Identifiants incorrects");
                    }

                    if (user.role === 'artisan' && user.status === 'pending') {
                        throw new Error("Votre compte est en attente de validation.");
                    }
                    if (user.status === 'rejected') {
                        throw new Error("Votre compte a été désactivé.");
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        image: user.image,
                        companyName: user.companyName,
                    };

                } catch (error) {
                    console.error("Auth Error:", error.message);
                    throw new Error(error.message || "Erreur d'authentification");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.image = user.image;
                token.companyName = user.companyName;
            }
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.image = token.image;
                session.user.companyName = token.companyName;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
